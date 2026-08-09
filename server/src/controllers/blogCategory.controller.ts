import { Request, Response, NextFunction } from 'express';
import BlogCategory from '../models/BlogCategory';
import AuditLog from '../models/AuditLog';
import { blogCategorySchema, sanitizePayload } from '../validators/blog.validator';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export const createCategory = async (req: any, res: Response, next: NextFunction) => {
  try {
    const parsed = blogCategorySchema.parse(req.body);
    const baseSlug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.name);
    let slug = baseSlug;
    let counter = 1;
    while (await BlogCategory.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const payload = { ...parsed, slug, createdBy: req.user?._id };
    const cat = await BlogCategory.create(payload as any);

    // Audit
    if (req.user) {
      await AuditLog.create({ userId: req.user._id, userName: req.user.email || req.user.name || '', module: 'BlogCategory', action: 'Created', oldValue: null, newValue: cat.toObject() as unknown as Record<string, unknown> });
    }

    res.status(201).json({ status: 'success', data: cat });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await BlogCategory.findById(id);
    if (!existing) return res.status(404).json({ status: 'error', message: 'Category not found' });

    const sanitized = sanitizePayload(req.body);
    if (sanitized.slug) {
      const base = slugify(sanitized.slug as string);
      if (base !== existing.slug) {
        let slug = base;
        let counter = 1;
        while (await BlogCategory.findOne({ slug, _id: { $ne: id } })) {
          slug = `${base}-${counter}`;
          counter++;
        }
        sanitized.slug = slug;
      }
    }

    const updated = await BlogCategory.findByIdAndUpdate(id, { ...sanitized, updatedBy: req.user?._id }, { new: true, runValidators: true });

    if (req.user) {
      await AuditLog.create({ userId: req.user._id, userName: req.user.email || req.user.name || '', module: 'BlogCategory', action: 'Updated', oldValue: existing.toObject() as unknown as Record<string, unknown>, newValue: updated?.toObject() as unknown as Record<string, unknown> });
    }

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const onlyActive = req.query.active === 'true' || false;
    const query: any = {};
    if (onlyActive) query.isActive = true;
    const cats = await BlogCategory.find(query).sort({ order: 1, name: 1 });
    res.status(200).json({ status: 'success', data: cats });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await BlogCategory.findById(id);
    if (!existing) return res.status(404).json({ status: 'error', message: 'Category not found' });

    await BlogCategory.findByIdAndDelete(id);
    if (req.user) {
      await AuditLog.create({ userId: req.user._id, userName: req.user.email || req.user.name || '', module: 'BlogCategory', action: 'Deleted', oldValue: existing.toObject() as unknown as Record<string, unknown>, newValue: null });
    }

    res.status(200).json({ status: 'success', message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
