import { Request, Response, NextFunction } from 'express';
import GalleryItem from '../models/GalleryItem';

export const getGalleryItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventType } = req.query;
    const filter = typeof eventType === 'string' ? { eventType } : {};

    const items = await GalleryItem.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: items,
    });
  } catch (error) {
    next(error);
  }
};
