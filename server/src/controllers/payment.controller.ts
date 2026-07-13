import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Payment from '../models/Payment';
import Booking, { PaymentStatus } from '../models/Booking';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

export const getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, status, paymentMethod, gateway } = req.query;
    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { paymentNumber: searchRegex },
        { invoiceId: searchRegex },
        { transactionId: searchRegex }
      ];
    }
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (gateway) query.gateway = gateway;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('clientId', 'firstName lastName email')
      .populate('bookingId', 'bookingNumber eventType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

export const createRazorpayOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId, amount, clientId } = req.body;
    
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${bookingId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Create a Pending payment record
    const payment = await Payment.create({
      paymentNumber: `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      bookingId,
      clientId,
      amount,
      remainingAmount: amount, // will be updated upon verification
      paymentMethod: 'Razorpay',
      gateway: 'Razorpay',
      gatewayOrderId: order.id,
      status: 'Pending',
      timeline: [{ action: 'Order Created', description: `Razorpay Order ${order.id} generated`, date: new Date() }]
    });

    res.status(200).json({
      status: 'success',
      data: { order, payment }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      res.status(400).json({ status: 'error', message: 'Signature verification failed' });
      return;
    }

    const payment = await Payment.findById(payment_id);
    if (!payment) {
      res.status(404).json({ message: 'Payment record not found' });
      return;
    }

    payment.status = 'Paid';
    payment.gatewayPaymentId = razorpay_payment_id;
    payment.gatewaySignature = razorpay_signature;
    payment.paymentDate = new Date();
    payment.timeline?.push({ action: 'Payment Verified', description: `Razorpay Payment ${razorpay_payment_id} verified successfully`, date: new Date() });
    
    await payment.save();

    // Update Booking
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.advancePaid = (booking.advancePaid || 0) + payment.amount;
      const remaining = booking.amount - booking.advancePaid;
      if (remaining <= 0) booking.paymentStatus = PaymentStatus.PAID;
      else booking.paymentStatus = PaymentStatus.PARTIALLY_PAID;
      await booking.save();
    }

    res.status(200).json({ status: 'success', data: payment });
  } catch (error) {
    next(error);
  }
};

export const createManualPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = { ...req.body };
    data.paymentNumber = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    data.timeline = [{ action: 'Payment Created', description: `Manual payment record created`, date: new Date() }];

    if (data.status === 'Paid') {
      data.paymentDate = new Date();
    }

    const payment = await Payment.create(data);

    if (payment.status === 'Paid') {
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.advancePaid = (booking.advancePaid || 0) + payment.amount;
        const remaining = booking.amount - booking.advancePaid;
        booking.paymentStatus = remaining <= 0 ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID;
        await booking.save();
      }
    }

    res.status(201).json({ status: 'success', data: payment });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    if (payment.gateway === 'Razorpay' && payment.gatewayPaymentId) {
      // Trigger Razorpay refund
      await razorpay.payments.refund(payment.gatewayPaymentId, {
        amount: payment.amount * 100, // full refund
        speed: 'normal'
      });
    }

    payment.status = 'Refunded';
    payment.refundStatus = 'Processed';
    payment.timeline?.push({ action: 'Refund Processed', description: `Payment refunded to client`, date: new Date() });
    await payment.save();

    // Revert booking advance
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.advancePaid = Math.max(0, (booking.advancePaid || 0) - payment.amount);
      const remaining = booking.amount - booking.advancePaid;
      if (booking.advancePaid === 0) booking.paymentStatus = PaymentStatus.PENDING;
      else if (remaining > 0) booking.paymentStatus = PaymentStatus.PARTIALLY_PAID;
      await booking.save();
    }

    res.status(200).json({ status: 'success', data: payment });
  } catch (error) {
    next(error);
  }
};
