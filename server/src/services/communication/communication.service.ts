import mongoose from 'mongoose';
import Client from '../../models/Client';
import User from '../../models/User';
import Notification from '../../models/Notification';
import CommunicationLog, { CommunicationChannel, ICommunicationLog } from '../../models/CommunicationLog';
import { findTemplate, resolveTemplate } from './template.service';
import { sendEmail as sendEmailProvider } from './email.service';
import { sendSMS as sendSMSProvider } from './sms.service';
import { sendWhatsApp as sendWhatsAppProvider } from './whatsapp.service';

export interface SendToClientInput { clientId: string; bookingId?: string; inquiryId?: string; event: string; channels: CommunicationChannel[]; variables?: Record<string, unknown>; idempotencyKey?: string; }
const preferences: Record<string, string> = { email: 'emailNotifications', whatsapp: 'whatsappNotifications', sms: 'smsNotifications' };
const asId = (value?: string) => value && mongoose.isValidObjectId(value) ? new mongoose.Types.ObjectId(value) : undefined;

export const sendCommunication = async (input: { clientId?: string; bookingId?: string; inquiryId?: string; channel: CommunicationChannel; recipient?: string; templateId?: string; templateKey?: string; subject?: string; content?: string; variables?: Record<string, unknown>; isTest?: boolean; idempotencyKey?: string; }): Promise<ICommunicationLog> => {
  if (input.idempotencyKey) { const prior = await CommunicationLog.findOne({ idempotencyKey: input.idempotencyKey, status: { $in: ['sent', 'delivered'] } }); if (prior) return prior; }
  const client = input.clientId ? await Client.findById(input.clientId).lean() : undefined;
  const user = client ? await User.findOne({ clientId: client._id }).lean() : undefined;
  const recipient = input.recipient || (input.channel === 'email' ? client?.email : client?.phone) || '';
  if (!recipient) throw new Error(`No recipient configured for ${input.channel}`);
  const template = await findTemplate(input.templateId, input.templateKey, input.channel);
  const rendered = template ? resolveTemplate(template, input.variables || {}) : { subject: input.subject || '', content: input.content || '', plainText: input.content || '' };
  if (!rendered.content) throw new Error('Message content is required');
  const log = await CommunicationLog.create({ clientId: asId(input.clientId), bookingId: asId(input.bookingId), inquiryId: asId(input.inquiryId), channel: input.channel, templateId: template?._id, recipient, subject: rendered.subject, messagePreview: rendered.content.slice(0, 500), status: 'sending', retryCount: 0, lastAttemptAt: new Date(), idempotencyKey: input.idempotencyKey, isTest: input.isTest || false });
  try {
    let result: { provider: string; providerMessageId?: string } = { provider: 'internal' };
    if (input.channel === 'email') result = await sendEmailProvider({ to: recipient, subject: rendered.subject || 'Yazhi Events', html: rendered.content, text: rendered.plainText });
    else if (input.channel === 'sms') result = await sendSMSProvider({ phone: recipient, message: rendered.plainText });
    else if (input.channel === 'whatsapp') result = await sendWhatsAppProvider({ phone: recipient, message: rendered.plainText, templateName: template?.key });
    else await Notification.create({ title: rendered.subject || 'Yazhi Events', message: rendered.plainText, type: 'Communication', priority: 'Medium', recipientType: 'Client', recipientId: user?._id || asId(input.clientId), module: 'Notifications', referenceId: asId(input.bookingId), referenceType: input.bookingId ? 'Booking' : 'Communication', deliveryStatus: 'Sent', channels: ['In-App'], scheduledAt: new Date() });
    log.status = input.channel === 'in_app' ? 'delivered' : 'sent'; log.sentAt = new Date(); log.deliveredAt = input.channel === 'in_app' ? new Date() : undefined; log.provider = result.provider; log.providerMessageId = result.providerMessageId; await log.save(); return log;
  } catch (error: any) { log.status = 'failed'; log.failedAt = new Date(); log.errorMessage = error?.message || 'Communication failed'; await log.save(); return log; }
};

export const sendToClient = async (input: SendToClientInput) => {
  const clientUser = await User.findOne({ clientId: input.clientId }).lean();
  const results: ICommunicationLog[] = [];
  for (const channel of input.channels) {
    if (channel !== 'in_app' && clientUser?.clientPreferences && clientUser.clientPreferences[preferences[channel] as keyof typeof clientUser.clientPreferences] === false) continue;
    const templateKey = `${input.event}_${channel.toUpperCase()}`;
    results.push(await sendCommunication({ ...input, channel, templateKey, variables: input.variables, idempotencyKey: input.idempotencyKey ? `${input.idempotencyKey}:${channel}` : undefined }));
  }
  return results;
};
