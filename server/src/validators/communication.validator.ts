import { z } from 'zod';

export const communicationChannelSchema = z.enum(['email', 'whatsapp', 'sms', 'in_app']);
export const communicationStatusSchema = z.enum(['queued', 'sending', 'sent', 'delivered', 'failed', 'cancelled']);

export const sendCommunicationSchema = z.object({
  clientId: z.string().optional(), bookingId: z.string().optional(), inquiryId: z.string().optional(),
  channel: communicationChannelSchema, recipient: z.string().trim().min(1).max(320).optional(),
  templateId: z.string().optional(), templateKey: z.string().trim().max(120).optional(),
  subject: z.string().trim().max(200).optional(), content: z.string().max(100000).optional(),
  variables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  isTest: z.boolean().default(false),
}).refine((payload) => Boolean(payload.templateId || payload.templateKey || payload.content), { message: 'templateId, templateKey, or content is required' });

export const communicationQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), channel: communicationChannelSchema.optional(), status: communicationStatusSchema.optional(), clientId: z.string().optional(), bookingId: z.string().optional(), from: z.coerce.date().optional(), to: z.coerce.date().optional(), search: z.string().max(120).optional() });
