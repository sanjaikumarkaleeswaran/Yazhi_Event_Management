import { dispatchPaymentCommunication } from '../utils/communicationService';
import { Request, Response, NextFunction } from 'express';
import Payment from '../models/Payment';
import Booking, { PaymentStatus } from '../models/Booking';
import AuditLog from '../models/AuditLog';
import Setting from '../models/Setting';
import {
  createRazorpayOrder as createRazorpayOrderService,
  verifyRazorpaySignature,
  verifyRazorpayWebhook,
  refundRazorpayPayment,
  fetchRazorpayPayment
} from '../services/payment/razorpay.service';

const generatePaymentNumber = () => `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

const updateBookingPaymentState = async (booking: any, amountReceived: number) => {
  if (!booking) return;
  booking.advancePaid = (booking.advancePaid || 0) + amountReceived;
  const remaining = booking.amount - booking.advancePaid;
  booking.paymentStatus = remaining <= 0 ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID;
  booking.timeline = booking.timeline || [];
  booking.timeline.push({ action: 'Payment Received', description: `Received ₹${amountReceived} payment`, date: new Date() });
  await booking.save();
};

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
      .populate('clientId', 'firstName lastName email phone')
      .populate('bookingId', 'bookingNumber eventType amount advancePaid paymentStatus')
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
    if (!bookingId || !amount || !clientId) {
      res.status(400).json({ status: 'error', message: 'bookingId, clientId and amount are required' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ status: 'error', message: 'Booking not found' });
      return;
    }

    const order = await createRazorpayOrderService({
      amount: Number(amount) * 100,
      currency: 'INR',
      receipt: `booking_${bookingId}_${Date.now()}`,
      notes: { bookingId: bookingId.toString(), clientId: clientId.toString() }
    });

    const payment = await Payment.create({
      paymentNumber: generatePaymentNumber(),
      bookingId,
      clientId,
      amount: Number(amount),
      remainingAmount: Number(amount),
      discount: 0,
      tax: 0,
      gst: 0,
      convenienceFee: 0,
      currency: 'INR',
      paymentMethod: 'Razorpay',
      gateway: 'Razorpay',
      gatewayOrderId: order.id,
      status: 'Pending',
      timeline: [{ action: 'Order Created', description: `Razorpay order ${order.id} generated`, date: new Date() }]
    });

    await AuditLog.create({
      userId: req.user?._id?.toString() || 'system',
      userName: req.user?.email || req.user?.name || 'System',
      module: 'Payments',
      action: 'Razorpay Order Created',
      oldValue: null,
      newValue: payment.toObject(),
      ipAddress: req.ip,
      browser: req.headers['user-agent'] || '',
      operatingSystem: ''
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
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !payment_id) {
      res.status(400).json({ status: 'error', message: 'All verification fields are required' });
      return;
    }

    const isValid = await verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      res.status(400).json({ status: 'error', message: 'Signature verification failed' });
      return;
    }

    const payment = await Payment.findById(payment_id);
    if (!payment) {
      res.status(404).json({ status: 'error', message: 'Payment record not found' });
      return;
    }

    if (payment.status === 'Paid') {
      res.status(400).json({ status: 'error', message: 'Payment has already been verified' });
      return;
    }

    const razorpayPayment = await fetchRazorpayPayment(razorpay_payment_id);

    payment.status = 'Paid';
    payment.gatewayPaymentId = razorpayPayment.id || razorpay_payment_id;
    payment.gatewaySignature = razorpay_signature;
    payment.transactionId = razorpayPayment.id || razorpay_payment_id;
    payment.paymentDate = new Date();
    payment.remainingAmount = 0;
    payment.timeline = payment.timeline || [];
    payment.timeline.push({ action: 'Payment Verified', description: `Razorpay payment ${razorpay_payment_id} verified successfully`, date: new Date() });
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      await updateBookingPaymentState(booking, payment.amount);
      await dispatchPaymentCommunication(payment, booking);
    }

    await AuditLog.create({
      userId: req.user?._id?.toString() || 'system',
      userName: req.user?.email || req.user?.name || 'System',
      module: 'Payments',
      action: 'Razorpay Payment Verified',
      oldValue: null,
      newValue: payment.toObject(),
      ipAddress: req.ip,
      browser: req.headers['user-agent'] || '',
      operatingSystem: ''
    });

    res.status(200).json({ status: 'success', data: payment });
  } catch (error) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body || {});

    const isValid = await verifyRazorpayWebhook(rawBody, signature);
    if (!isValid) {
      res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
      return;
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    if (!paymentEntity) {
      res.status(400).json({ status: 'error', message: 'Webhook payload missing payment entity' });
      return;
    }

    const payment = await Payment.findOne({
      $or: [
        { gatewayPaymentId: paymentEntity.id },
        { gatewayOrderId: paymentEntity.order_id }
      ]
    });

    if (!payment) {
      res.status(404).json({ status: 'error', message: 'Payment record not found for webhook' });
      return;
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      if (payment.status !== 'Paid') {
        payment.status = 'Paid';
        payment.gatewayPaymentId = paymentEntity.id;
        payment.transactionId = paymentEntity.id;
        payment.paymentDate = new Date(paymentEntity.created_at * 1000);
        payment.remainingAmount = 0;
        payment.timeline = payment.timeline || [];
        payment.timeline.push({ action: 'Webhook Payment Captured', description: `Razorpay webhook confirmed payment ${paymentEntity.id}`, date: new Date() });
        await payment.save();

        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          await updateBookingPaymentState(booking, payment.amount);
          await dispatchPaymentCommunication(payment, booking);
        }
      }
    }

    res.status(200).json({ status: 'success', message: 'Webhook processed' });
  } catch (error) {
    next(error);
  }
};

export const createManualPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = { ...req.body } as any;
    data.paymentNumber = generatePaymentNumber();
    data.timeline = [{ action: 'Payment Created', description: 'Manual payment record created', date: new Date() }];

    if (data.status === 'Paid') {
      data.paymentDate = new Date();
      data.remainingAmount = 0;
    }

    const payment = await Payment.create(data);

    if (payment.status === 'Paid') {
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        await updateBookingPaymentState(booking, payment.amount);
        await dispatchPaymentCommunication(payment, booking);
      }
    }

    await AuditLog.create({
      userId: req.user?._id?.toString() || 'system',
      userName: req.user?.email || req.user?.name || 'System',
      module: 'Payments',
      action: 'Manual Payment Created',
      oldValue: null,
      newValue: payment.toObject(),
      ipAddress: req.ip,
      browser: req.headers['user-agent'] || '',
      operatingSystem: ''
    });

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
      res.status(404).json({ status: 'error', message: 'Payment not found' });
      return;
    }

    if (payment.status === 'Refunded') {
      res.status(400).json({ status: 'error', message: 'Payment is already refunded' });
      return;
    }

    let refundResult: any = null;
    if (payment.gateway === 'Razorpay' && payment.gatewayPaymentId) {
      refundResult = await refundRazorpayPayment(payment.gatewayPaymentId, payment.amount * 100, {
        paymentId: payment._id.toString()
      });
    }

    payment.status = 'Refunded';
    payment.refundStatus = refundResult?.status || 'Processed';
    payment.timeline = payment.timeline || [];
    payment.timeline.push({ action: 'Refund Processed', description: `Payment refunded to client`, date: new Date() });
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.advancePaid = Math.max(0, (booking.advancePaid || 0) - payment.amount);
      const remaining = booking.amount - booking.advancePaid;
      booking.paymentStatus = booking.advancePaid === 0 ? PaymentStatus.PENDING : PaymentStatus.PARTIALLY_PAID;
      booking.timeline = booking.timeline || [];
      booking.timeline.push({ action: 'Payment Refunded', description: `Refund processed for payment ${payment.paymentNumber}`, date: new Date() });
      await booking.save();
    }

    await AuditLog.create({
      userId: req.user?._id?.toString() || 'system',
      userName: req.user?.email || req.user?.name || 'System',
      module: 'Payments',
      action: 'Payment Refunded',
      oldValue: null,
      newValue: payment.toObject(),
      ipAddress: req.ip,
      browser: req.headers['user-agent'] || '',
      operatingSystem: ''
    });

    res.status(200).json({ status: 'success', data: payment });
  } catch (error) {
    next(error);
  }
};
