import Setting from '../../models/Setting';
import type { ProviderResult } from './email.service';

export const sendWhatsApp = async (input: { phone: string; message: string; templateName?: string; }): Promise<ProviderResult> => {
  const settings = await Setting.findOne({}).lean();
  if (settings?.dryRunMode || !settings?.whatsappApiToken || !settings.whatsappBusinessNumber) {
    console.log('[WHATSAPP DRY RUN]', { recipient: input.phone, template: input.templateName || 'approved-template' });
    return { provider: 'console' };
  }
  if (!input.templateName) throw new Error('WhatsApp messages require an approved template name');
  const response = await fetch(`https://graph.facebook.com/v19.0/${settings.whatsappBusinessNumber}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${settings.whatsappApiToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: input.phone, type: 'template', template: { name: input.templateName, language: { code: 'en' }, components: [] } }) });
  if (!response.ok) throw new Error(`WhatsApp provider returned ${response.status}`);
  const result = await response.json() as { messages?: Array<{ id?: string }> };
  return { provider: 'whatsapp_business', providerMessageId: result.messages?.[0]?.id };
};
