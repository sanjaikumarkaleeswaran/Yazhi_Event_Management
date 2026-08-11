import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().trim().min(1).max(160), key: z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9_]+$/),
  channel: z.enum(['email', 'whatsapp', 'sms']), subject: z.string().trim().max(200).optional(),
  content: z.string().min(1).max(100000), plainText: z.string().max(10000).optional(),
  variables: z.array(z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/)).max(50).default([]),
  status: z.enum(['active', 'inactive']).default('active'), description: z.string().max(500).optional(),
});
