import { Request, Response, NextFunction } from 'express';
import Testimonial from '../models/Testimonial';

export const getTestimonials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};
