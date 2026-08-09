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

export const blogPostSchema = blogPostMinimalSchema.extend({
  excerpt: z.string().max(1000).default(''),
  coverImage: z.string().max(1000).default(''),
  coverImageAlt: z.string().max(200).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  status: z.enum(['Draft', 'Scheduled', 'Published', 'Archived']).optional(),
  visibility: z.enum(['Public', 'Private']).optional(),
  scheduledAt: z.coerce.date().optional(),
  publishedAt: z.coerce.date().optional(),
  featured: z.boolean().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(170).optional(),
  focusKeyword: z.string().max(120).optional(),
  canonicalUrl: z.string().max(500).optional(),
  ogImage: z.string().max(1000).optional(),
  metaRobots: z.string().max(80).optional(),
  schemaType: z.string().max(40).optional(),
  seo: z.object({
    title: z.string().max(70).optional(),
    description: z.string().max(170).optional(),
    keywords: z.array(z.string().max(80)).max(50).optional(),
    canonicalUrl: z.string().max(500).optional(),
    ogTitle: z.string().max(120).optional(),
    ogDescription: z.string().max(200).optional(),
    ogImage: z.string().max(1000).optional(),
    twitterTitle: z.string().max(120).optional(),
    twitterDescription: z.string().max(200).optional(),
    twitterImage: z.string().max(1000).optional(),
    noIndex: z.boolean().optional(),
  }).optional(),
  social: z.record(z.string(), z.string().max(1000)).optional(),
}).passthrough();

export const sanitizePayload = (payload: Record<string, unknown>) => {
  const sanitized: Record<string, unknown> = {};
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined) sanitized[k] = v;
  });
  return sanitized;
};
