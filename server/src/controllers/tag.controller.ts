import { Request, Response, NextFunction } from 'express';
import Tag from '../models/Tag';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const createTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug, isPopular, isTrending } = req.body;
    
    const tagSlug = slug ? slugify(slug) : slugify(name);
    
    const existing = await Tag.findOne({ slug: tagSlug });
    if (existing) {
      res.status(400).json({ status: 'error', message: 'Tag slug already exists' });
      return;
    }

    const newTag = await Tag.create({
      name,
      slug: tagSlug,
      isPopular: !!isPopular,
      isTrending: !!isTrending
    });

    res.status(201).json({ status: 'success', data: newTag });
  } catch (error) {
    next(error);
  }
};

export const getAllTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.status(200).json({ status: 'success', data: tags });
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, isPopular, isTrending } = req.body;

    const existing = await Tag.findById(id);
    if (!existing) {
      res.status(404).json({ status: 'error', message: 'Tag not found' });
      return;
    }

    const updates: any = { name, isPopular, isTrending };

    if (slug) {
      const tagSlug = slugify(slug);
      if (tagSlug !== existing.slug) {
        const duplicate = await Tag.findOne({ slug: tagSlug });
        if (duplicate) {
          res.status(400).json({ status: 'error', message: 'Tag slug already exists' });
          return;
        }
        updates.slug = tagSlug;
      }
    } else if (name && name !== existing.name) {
      const tagSlug = slugify(name);
      if (tagSlug !== existing.slug) {
        const duplicate = await Tag.findOne({ slug: tagSlug });
        if (!duplicate) {
          updates.slug = tagSlug;
        }
      }
    }

    const updatedTag = await Tag.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    res.status(200).json({ status: 'success', data: updatedTag });
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const tag = await Tag.findByIdAndDelete(id);
    
    if (!tag) {
      res.status(404).json({ status: 'error', message: 'Tag not found' });
      return;
    }
    
    res.status(200).json({ status: 'success', message: 'Tag deleted successfully' });
  } catch (error) {
    next(error);
  }
};
