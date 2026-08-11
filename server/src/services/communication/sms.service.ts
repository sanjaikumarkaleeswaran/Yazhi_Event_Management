import twilio from 'twilio';
import Setting from '../../models/Setting';
import type { ProviderResult } from './email.service';

export const sendSMS = async (input: { phone: string; message: string; }): Promise<ProviderResult> => {
  const settings = await Setting.findOne({}).lean();
  if (settings?.dryRunMode || !settings?.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioPhoneNumber) {
    console.log('[SMS DRY RUN]', { recipient: input.phone, message: input.message.slice(0, 160) });
    return { provider: 'console' };
  }
  const result = await twilio(settings.twilioAccountSid, settings.twilioAuthToken).messages.create({ body: input.message, from: settings.twilioPhoneNumber, to: input.phone });
  return { provider: 'twilio', providerMessageId: result.sid };
};
