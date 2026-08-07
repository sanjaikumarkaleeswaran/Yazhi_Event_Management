import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Communication, { CommunicationType, ICommunication } from '../models/Communication';
import Setting from '../models/Setting';

export interface CommunicationInput {
  type: CommunicationType;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  message: string;
  template?: string;
  bookingId?: string;
  clientId?: string;
  inquiryId?: string;
  sentBy?: string;
}

const idOrUndefined = (value?: string) => value || undefined;

export const deliverCommunication = async (input: CommunicationInput): Promise<ICommunication> => {
  const communication = await Communication.create({
    ...input,
    bookingId: idOrUndefined(input.bookingId),
    clientId: idOrUndefined(input.clientId),
    inquiryId: idOrUndefined(input.inquiryId),
    sentBy: idOrUndefined(input.sentBy),
    status: 'Queued',
  });

  try {
    const settings = await Setting.findOne({});
    let providerId = 'SIMULATED';
    let providerDetails = 'Console fallback: provider credentials are not configured.';

    if (input.type === 'Email' && input.recipientEmail && settings?.enableEmailNotifications && settings.smtpHost && settings.smtpUsername) {
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 587,
        secure: settings.smtpPort === 465,
        auth: { user: settings.smtpUsername, pass: settings.smtpPassword },
      });
      const info = await transporter.sendMail({
        from: settings.fromEmail ? `${settings.fromName} <${settings.fromEmail}>` : settings.smtpUsername,
        to: input.recipientEmail,
        subject: input.subject || 'Yazhi Events',
        text: input.message,
      });
      providerId = info.messageId;
      providerDetails = 'Delivered through SMTP.';
    } else if (input.type === 'SMS' && input.recipientPhone && settings?.twilioAccountSid && settings.twilioAuthToken && settings.twilioPhoneNumber) {
      const client = twilio(settings.twilioAccountSid, settings.twilioAuthToken);
      const result = await client.messages.create({ body: input.message, from: settings.twilioPhoneNumber, to: input.recipientPhone });
      providerId = result.sid;
      providerDetails = 'Sent through Twilio.';
    } else if (input.type === 'WhatsApp' && input.recipientPhone && settings?.whatsappApiToken && settings.whatsappBusinessNumber && settings.webhookUrl) {
      const response = await fetch(`https://graph.facebook.com/v19.0/${settings.whatsappBusinessNumber}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${settings.whatsappApiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: input.recipientPhone, type: 'text', text: { body: input.message } }),
      });
      if (!response.ok) throw new Error(`WhatsApp API returned ${response.status}`);
      const result = await response.json() as { messages?: Array<{ id: string }> };
      providerId = result.messages?.[0]?.id || providerId;
      providerDetails = 'Sent through WhatsApp Business API.';
    } else {
      console.log(`[COMMUNICATION SIMULATION] ${input.type} to ${input.recipientName}: ${input.message}`);
    }

    communication.status = 'Sent';
    communication.sentAt = new Date();
    communication.errorMessage = providerDetails === 'Console fallback: provider credentials are not configured.' ? providerDetails : undefined;
    await communication.save();
    console.log(`[COMMUNICATION ${providerId}] ${providerDetails}`);
    return communication;
  } catch (error: any) {
    communication.status = 'Failed';
    communication.errorMessage = error?.message || 'Communication provider failed';
    await communication.save();
    return communication;
  }
};

export const resendCommunication = async (communication: ICommunication) => deliverCommunication({
  type: communication.type,
  recipientName: communication.recipientName,
  recipientEmail: communication.recipientEmail,
  recipientPhone: communication.recipientPhone,
  subject: communication.subject,
  message: communication.message,
  template: communication.template,
  bookingId: communication.bookingId?.toString(),
  clientId: communication.clientId?.toString(),
  inquiryId: communication.inquiryId?.toString(),
  sentBy: communication.sentBy?.toString(),
});
export const dispatchBookingCommunication = async (booking: any, template: string = 'Booking Confirmation') => {
  const name = booking.clientName || booking.name || booking.customerName || 'Client';
  const message = `Hello ${name}, your booking ${booking.bookingNumber || ''} is ${booking.status || 'confirmed'} with Yazhi Events.`;
  const base = { recipientName: name, recipientEmail: booking.email || booking.clientEmail, recipientPhone: booking.phone || booking.clientPhone, message, template, bookingId: booking._id?.toString(), clientId: booking.clientId?.toString() };
  await Promise.all([base.recipientEmail ? deliverCommunication({ ...base, type: 'Email', subject: template }) : Promise.resolve(), base.recipientPhone ? deliverCommunication({ ...base, type: 'WhatsApp' }) : Promise.resolve()]);
};

export const dispatchInquiryCommunication = async (inquiry: any) => {
  if (!inquiry.email) return;
  await deliverCommunication({ type: 'Email', recipientName: inquiry.name || 'Client', recipientEmail: inquiry.email, subject: 'Welcome to Yazhi Events', message: `Thank you for your inquiry about ${inquiry.eventType || 'your event'}. Our team will contact you shortly.`, template: 'Inquiry Received', inquiryId: inquiry._id?.toString() });
};

export const dispatchPaymentCommunication = async (payment: any, booking?: any) => {
  if (!booking?.email && !booking?.clientEmail) return;
  await deliverCommunication({ type: 'Email', recipientName: booking.clientName || booking.name || 'Client', recipientEmail: booking.email || booking.clientEmail, subject: 'Payment Received', message: `We received your payment of ${payment.amount || ''}. Thank you for choosing Yazhi Events.`, template: 'Payment Received', bookingId: booking._id?.toString(), clientId: booking.clientId?.toString() });
};
