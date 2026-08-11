import { z } from 'zod';
import { AUTOMATION_EVENTS } from '../models/AutomationRule';

export const automationRuleSchema = z.object({
  name: z.string().trim().min(1).max(160), event: z.enum(AUTOMATION_EVENTS),
  channels: z.array(z.enum(['email', 'whatsapp', 'sms'])).min(1),
  templateMapping: z.record(z.string(), z.string()), enabled: z.boolean().default(true),
  conditions: z.record(z.string(), z.unknown()).default({}), delay: z.number().int().min(0).max(2592000).default(0),
});
