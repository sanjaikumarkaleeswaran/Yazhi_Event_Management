import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface BookingPDFData {
  bookingId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  eventType: string;
  eventDate: string;
  venue: string;
  guestCount?: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  items?: Array<{ name: string; cost: number }>;
  createdAt?: string;
}

interface PaymentReceiptPDFData {
  receiptId: string;
  bookingId: string;
  clientName: string;
  amountPaid: number;
  paymentMethod: string;
  transactionId?: string;
  paymentDate: string;
  remainingBalance: number;
  totalAmount: number;
}

export class PDFGeneratorService {
  /**
   * Generates a branded Invoice PDF stream directly to Express Response
   */
  static generateInvoicePDF(data: BookingPDFData, res: Response): void {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Stream to response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Invoice_${data.bookingId}.pdf`);
    doc.pipe(res);

    // Color Palette
    const primaryGold = '#D4AF37';
    const darkSlate = '#1F2937';
    const lightBg = '#F9FAFB';

    // Header Branding
    doc.rect(0, 0, 595.28, 90).fill('#0F172A');
    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('YAZHI EVENTS', 40, 25);
    doc.fillColor(primaryGold).fontSize(10).font('Helvetica').text('TAMIL CULTURAL & LUXURY EVENT MANAGEMENT', 40, 55);

    doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('INVOICE', 450, 25, { align: 'right' });
    doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text(`#${data.bookingId.slice(-8).toUpperCase()}`, 450, 48, { align: 'right' });

    // Client & Invoice Details Grid
    let y = 110;
    doc.fillColor(darkSlate).fontSize(12).font('Helvetica-Bold').text('Billed To:', 40, y);
    doc.fillColor('#4B5563').fontSize(10).font('Helvetica')
      .text(data.clientName, 40, y + 18)
      .text(data.clientEmail || 'N/A', 40, y + 32)
      .text(data.clientPhone || 'N/A', 40, y + 46);

    doc.fillColor(darkSlate).fontSize(12).font('Helvetica-Bold').text('Event Details:', 320, y);
    doc.fillColor('#4B5563').fontSize(10).font('Helvetica')
      .text(`Event Type: ${data.eventType}`, 320, y + 18)
      .text(`Event Date: ${data.eventDate}`, 320, y + 32)
      .text(`Venue: ${data.venue}`, 320, y + 46);

    // Divider
    y = 190;
    doc.moveTo(40, y).lineTo(555, y).strokeColor('#E5E7EB').lineWidth(1).stroke();

    // Table Header
    y += 15;
    doc.rect(40, y, 515, 25).fill(lightBg);
    doc.fillColor(darkSlate).fontSize(10).font('Helvetica-Bold')
      .text('Description / Service Item', 50, y + 7)
      .text('Status', 350, y + 7)
      .text('Amount (INR)', 450, y + 7, { align: 'right' });

    // Table Item Row
    y += 30;
    doc.fillColor('#1F2937').fontSize(10).font('Helvetica')
      .text(`${data.eventType} Planning & Execution Package`, 50, y)
      .text(data.status.toUpperCase(), 350, y)
      .text(`₹${data.totalAmount.toLocaleString('en-IN')}`, 450, y, { align: 'right' });

    y += 20;
    doc.fillColor('#6B7280').fontSize(9).font('Helvetica')
      .text(`Venue: ${data.venue} | Guest Count: ${data.guestCount || 'N/A'}`, 50, y);

    // Items list if present
    if (data.items && data.items.length > 0) {
      data.items.forEach((item) => {
        y += 20;
        doc.fillColor('#1F2937').fontSize(9).font('Helvetica')
          .text(item.name, 50, y)
          .text(`₹${item.cost.toLocaleString('en-IN')}`, 450, y, { align: 'right' });
      });
    }

    // Divider
    y += 35;
    doc.moveTo(40, y).lineTo(555, y).strokeColor('#E5E7EB').stroke();

    // Summary Section
    y += 15;
    const summaryX = 350;
    doc.fontSize(10).font('Helvetica').fillColor('#4B5563');

    doc.text('Total Invoiced Amount:', summaryX, y);
    doc.font('Helvetica-Bold').fillColor(darkSlate).text(`₹${data.totalAmount.toLocaleString('en-IN')}`, 450, y, { align: 'right' });

    y += 20;
    doc.font('Helvetica').fillColor('#16A34A').text('Total Paid to Date:', summaryX, y);
    doc.font('Helvetica-Bold').fillColor('#16A34A').text(`- ₹${data.paidAmount.toLocaleString('en-IN')}`, 450, y, { align: 'right' });

    y += 20;
    doc.rect(summaryX - 10, y - 5, 215, 30).fill('#FEF3C7');
    doc.font('Helvetica-Bold').fillColor('#B45309').text('Remaining Balance Due:', summaryX, y + 4);
    doc.font('Helvetica-Bold').fillColor('#B45309').text(`₹${data.balanceAmount.toLocaleString('en-IN')}`, 450, y + 4, { align: 'right' });

    // Terms & Footer
    y = 680;
    doc.rect(40, y, 515, 60).fill('#F8FAFC');
    doc.fillColor(darkSlate).fontSize(9).font('Helvetica-Bold').text('Terms & Payment Policy:', 50, y + 10);
    doc.fillColor('#64748B').fontSize(8).font('Helvetica')
      .text('1. Full payment balance is due 5 days prior to the event date.', 50, y + 24)
      .text('2. Payments can be made via Razorpay Portal, Bank Transfer, or UPI.', 50, y + 36);

    // Footer Signatures
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
      .text('Thank you for trusting Yazhi Events to curate your special occasion.', 40, 765, { align: 'center' })
      .text('Yazhi Events Platform • Automated System Document • www.yazhievents.com', 40, 778, { align: 'center' });

    doc.end();
  }

  /**
   * Generates an Event Booking Contract PDF
   */
  static generateContractPDF(data: BookingPDFData, res: Response): void {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Contract_${data.bookingId}.pdf`);
    doc.pipe(res);

    const primaryColor = '#831843'; // Burgundy
    const goldColor = '#D4AF37';

    // Header
    doc.rect(0, 0, 595.28, 85).fill(primaryColor);
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('YAZHI EVENTS', 40, 20);
    doc.fillColor(goldColor).fontSize(10).font('Helvetica').text('EVENT MANAGEMENT SERVICE CONTRACT & AGREEMENT', 40, 48);

    let y = 105;
    doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('EVENT SERVICE AGREEMENT', 40, y, { align: 'center' });

    y += 30;
    doc.fontSize(9).font('Helvetica').fillColor('#374151')
      .text(`This Event Planning Agreement ("Agreement") is entered into by and between Yazhi Events ("Service Provider") and ${data.clientName} ("Client") for the execution of ${data.eventType}.`, 40, y, { width: 515, align: 'justify' });

    y += 40;
    doc.rect(40, y, 515, 90).fill('#FFFBEB').strokeColor('#FCD34D').lineWidth(1).stroke();
    doc.fillColor('#92400E').fontSize(11).font('Helvetica-Bold').text('1. Event Specifications', 50, y + 10);
    doc.fillColor('#78350F').fontSize(9).font('Helvetica')
      .text(`• Client Name: ${data.clientName}`, 50, y + 28)
      .text(`• Booking Ref ID: ${data.bookingId}`, 50, y + 42)
      .text(`• Event Type: ${data.eventType}`, 50, y + 56)
      .text(`• Scheduled Date: ${data.eventDate}`, 300, y + 28)
      .text(`• Event Venue: ${data.venue}`, 300, y + 42)
      .text(`• Total Agreement Value: ₹${data.totalAmount.toLocaleString('en-IN')}`, 300, y + 56);

    y += 110;
    doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text('2. Scope of Services', 40, y);
    doc.fillColor('#374151').fontSize(9).font('Helvetica')
      .text('Yazhi Events agrees to provide end-to-end event planning, catering coordination, decor setup, audio-visual management, and workforce synchronization as per the agreed package tier.', 40, y + 16, { width: 515 });

    y += 45;
    doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text('3. Financial Schedule & Terms', 40, y);
    doc.fillColor('#374151').fontSize(9).font('Helvetica')
      .text(`Total Agreed Cost: ₹${data.totalAmount.toLocaleString('en-IN')}`, 40, y + 16)
      .text(`Deposit / Advance Paid: ₹${data.paidAmount.toLocaleString('en-IN')}`, 40, y + 30)
      .text(`Outstanding Balance Due: ₹${data.balanceAmount.toLocaleString('en-IN')}`, 40, y + 44);

    y += 75;
    doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text('4. Cancellation & Refund Policy', 40, y);
    doc.fillColor('#374151').fontSize(9).font('Helvetica')
      .text('Cancellations made 15+ days prior to event date receive 70% refund of advance deposit. Cancellations within 7 days are non-refundable due to vendor lock-in commitments.', 40, y + 16, { width: 515 });

    // Signature Blocks
    y = 620;
    doc.moveTo(40, y).lineTo(555, y).strokeColor('#D1D5DB').stroke();

    y += 25;
    doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold')
      .text('Client Signature (Authorized)', 40, y)
      .text('Yazhi Events Authorization', 320, y);

    y += 40;
    doc.moveTo(40, y).lineTo(220, y).strokeColor('#9CA3AF').stroke();
    doc.moveTo(320, y).lineTo(500, y).strokeColor('#9CA3AF').stroke();

    y += 8;
    doc.fillColor('#6B7280').fontSize(9).font('Helvetica')
      .text(`Signed by: ${data.clientName}`, 40, y)
      .text('Signed by: Authorized Managing Director', 320, y);

    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
      .text('Yazhi Event Management Platform • Legally Binding Contract Copy', 40, 770, { align: 'center' });

    doc.end();
  }

  /**
   * Generates Payment Receipt PDF
   */
  static generateReceiptPDF(data: PaymentReceiptPDFData, res: Response): void {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Receipt_${data.receiptId}.pdf`);
    doc.pipe(res);

    const tealColor = '#0D9488';

    doc.rect(0, 0, 595.28, 80).fill(tealColor);
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('YAZHI EVENTS', 40, 20);
    doc.fillColor('#CCFBF1').fontSize(10).font('Helvetica').text('OFFICIAL PAYMENT RECEIPT', 40, 48);

    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('RECEIPT', 450, 25, { align: 'right' });
    doc.fillColor('#CCFBF1').fontSize(9).font('Helvetica').text(`#${data.receiptId.slice(-8).toUpperCase()}`, 450, 48, { align: 'right' });

    let y = 110;
    doc.rect(40, y, 515, 120).fill('#F0FDFA').strokeColor('#99F6E4').stroke();

    doc.fillColor('#134E4A').fontSize(12).font('Helvetica-Bold').text('Payment Confirmation', 55, y + 15);
    doc.fillColor('#0F766E').fontSize(10).font('Helvetica')
      .text(`Received From: ${data.clientName}`, 55, y + 35)
      .text(`Booking Reference: ${data.bookingId}`, 55, y + 50)
      .text(`Payment Method: ${data.paymentMethod.toUpperCase()}`, 55, y + 65)
      .text(`Transaction Ref / ID: ${data.transactionId || 'N/A'}`, 55, y + 80)
      .text(`Date Processed: ${data.paymentDate}`, 300, y + 35)
      .text(`Total Event Price: ₹${data.totalAmount.toLocaleString('en-IN')}`, 300, y + 50)
      .text(`Remaining Balance: ₹${data.remainingBalance.toLocaleString('en-IN')}`, 300, y + 65);

    y += 150;
    doc.rect(40, y, 515, 50).fill('#CCFBF1');
    doc.fillColor('#047857').fontSize(14).font('Helvetica-Bold').text('Amount Received:', 55, y + 16);
    doc.fillColor('#047857').fontSize(18).font('Helvetica-Bold').text(`₹${data.amountPaid.toLocaleString('en-IN')}`, 430, y + 14, { align: 'right' });

    y = 750;
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
      .text('This receipt is computer-generated and confirms successful transaction processing.', 40, y, { align: 'center' });

    doc.end();
  }
}
