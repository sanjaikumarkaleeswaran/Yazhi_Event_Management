import nodemailer from 'nodemailer';
import Setting from '../../models/Setting';

export interface ProviderResult { provider: string; providerMessageId?: string; }

export const sendEmail = async (input: { to: string; subject: string; html: string; text?: string; replyTo?: string; }): Promise<ProviderResult> => {
  const settings = await Setting.findOne({}).lean();
  if (settings?.dryRunMode || !settings?.smtpHost || !settings.smtpUsername) {
    console.log('[EMAIL DRY RUN]', { recipient: input.to, subject: input.subject });
    return { provider: 'console' };
  }
  const transporter = nodemailer.createTransport({ host: settings.smtpHost, port: settings.smtpPort || 587, secure: settings.smtpPort === 465, auth: { user: settings.smtpUsername, pass: settings.smtpPassword } });
  const result = await transporter.sendMail({ from: settings.fromEmail ? `${settings.fromName} <${settings.fromEmail}>` : settings.smtpUsername, to: input.to, subject: input.subject, html: input.html, text: input.text, replyTo: input.replyTo });
  return { provider: 'smtp', providerMessageId: result.messageId };
};
