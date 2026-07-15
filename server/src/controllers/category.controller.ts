import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug, description, color, icon, displayOrder } = req.body;
    
    const categorySlug = slug ? slugify(slug) : slugify(name);
    
    // Check if slug already exists
    const existing = await Category.findOne({ slug: categorySlug });
    if (existing) {
      res.status(400).json({ status: 'error', message: 'Category slug already exists' });
      return;
    }

    const newCategory = await Category.create({
      name,
      slug: categorySlug,
      description,
      color,
      icon,
      displayOrder: displayOrder || 0
    });

    res.status(201).json({ status: 'success', data: newCategory });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, color, icon, displayOrder } = req.body;

    const existing = await Category.findById(id);
    if (!existing) {
      res.status(404).json({ status: 'error', message: 'Category not found' });
      return;
    }

    const updates: any = { name, description, color, icon, displayOrder };

    if (slug) {
      const categorySlug = slugify(slug);
      if (categorySlug !== existing.slug) {
        const duplicate = await Category.findOne({ slug: categorySlug });
        if (duplicate) {
          res.status(400).json({ status: 'error', message: 'Category slug already exists' });
          return;
        }
        updates.slug = categorySlug;
      }
    } else if (name && name !== existing.name) {
      // Re-generate slug if name changed but slug not provided
      const categorySlug = slugify(name);
      if (categorySlug !== existing.slug) {
        const duplicate = await Category.findOne({ slug: categorySlug });
        if (!duplicate) {
          updates.slug = categorySlug;
        }
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    res.status(200).json({ status: 'success', data: updatedCategory });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      res.status(404).json({ status: 'error', message: 'Category not found' });
      return;
    }
    
    res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
