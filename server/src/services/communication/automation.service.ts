import AutomationRule, { AutomationEvent } from '../../models/AutomationRule';
import { sendToClient } from './communication.service';

export const emitAutomation = async (event: AutomationEvent, input: { clientId?: string; bookingId?: string; inquiryId?: string; variables?: Record<string, unknown>; eventId?: string }) => {
  if (!input.clientId) return [];
  const rules = await AutomationRule.find({ event, enabled: true }).lean();
  const results = [];
  for (const rule of rules) {
    results.push(...await sendToClient({ clientId: input.clientId, bookingId: input.bookingId, inquiryId: input.inquiryId, event, channels: rule.channels, variables: input.variables, idempotencyKey: input.eventId ? `${input.eventId}:${rule._id}` : undefined }));
  }
  return results;
};
