import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import { PDFGeneratorService } from '../utils/pdfGenerator';

/**
 * Controller for generating & streaming PDF Documents (Invoices, Contracts, Receipts)
 */
export const downloadBookingInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    const paid = booking.advancePaid || 0;
    const balance = Math.max(0, booking.amount - paid);

    PDFGeneratorService.generateInvoicePDF(
      {
        bookingId: booking.bookingNumber || booking._id.toString(),
        clientName: booking.clientName,
        clientPhone: booking.phone,
        clientEmail: booking.email,
        eventType: booking.eventType,
        eventDate: new Date(booking.eventDate).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        venue: booking.venue || 'To Be Finalized',
        guestCount: booking.guestCount,
        totalAmount: booking.amount,
        paidAmount: paid,
        balanceAmount: balance,
        status: booking.status,
      },
      res
    );
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate Invoice PDF' });
  }
};

export const downloadBookingContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    const paid = booking.advancePaid || 0;
    const balance = Math.max(0, booking.amount - paid);

    PDFGeneratorService.generateContractPDF(
      {
        bookingId: booking.bookingNumber || booking._id.toString(),
        clientName: booking.clientName,
        clientPhone: booking.phone,
        clientEmail: booking.email,
        eventType: booking.eventType,
        eventDate: new Date(booking.eventDate).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        venue: booking.venue || 'Main Event Hall',
        guestCount: booking.guestCount,
        totalAmount: booking.amount,
        paidAmount: paid,
        balanceAmount: balance,
        status: booking.status,
      },
      res
    );
  } catch (error: any) {
    console.error('Error generating contract PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate Contract PDF' });
  }
};

export const downloadPaymentReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate('bookingId clientId');

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    const booking: any = payment.bookingId;
    const clientName = booking?.clientName || 'Valued Client';

    PDFGeneratorService.generateReceiptPDF(
      {
        receiptId: payment.paymentNumber || payment._id.toString(),
        bookingId: booking?.bookingNumber || 'N/A',
        clientName,
        amountPaid: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId || payment.gatewayPaymentId,
        paymentDate: new Date(payment.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        remainingBalance: payment.remainingAmount || 0,
        totalAmount: booking?.amount || payment.amount,
      },
      res
    );
  } catch (error: any) {
    console.error('Error generating payment receipt PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate Receipt PDF' });
  }
};
