import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import Inquiry from '../models/Inquiry';

export const createInquiryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('phone').trim().notEmpty().withMessage('Phone number is required').escape(),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('eventType').trim().notEmpty().withMessage('Event type is required').escape(),
  body('eventDate').isISO8601().toDate().withMessage('Valid event date is required'),
  body('city').trim().notEmpty().withMessage('City is required').escape(),
  body('message').trim().notEmpty().withMessage('Message is required').escape(),
];

export const createInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, email, eventType, eventDate, city, message } = req.body;

    const newInquiry = await Inquiry.create({
      name,
      phone,
      email,
      eventType,
      eventDate,
      city,
      message,
    });

    res.status(201).json({
      status: 'success',
      data: newInquiry,
    });
  } catch (error) {
    next(error);
  }
};
