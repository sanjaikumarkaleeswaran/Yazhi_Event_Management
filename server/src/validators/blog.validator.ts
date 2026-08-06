import { z } from 'zod';

export const blogCategorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).optional(),
  icon: z.string().max(500).optional(),
  color: z.string().max(40).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const blogCommentSchema = z.object({
  blogId: z.string().min(1),
  name: z.string().min(1).max(120),
  email: z.string().email().optional(),
  message: z.string().min(2).max(4000),
});

export const blogPostMinimalSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(1000).optional(),
  content: z.string().min(1),
  coverImage: z.string().max(1000).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
});

export const sanitizePayload = (payload: Record<string, unknown>) => {
  const sanitized: Record<string, unknown> = {};
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined) sanitized[k] = v;
  });
  return sanitized;
};
