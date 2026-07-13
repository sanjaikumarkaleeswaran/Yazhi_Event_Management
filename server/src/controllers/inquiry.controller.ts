import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import Inquiry, { InquiryStatus } from '../models/Inquiry';
import Booking from '../models/Booking';

const generateInquiryNumber = () => {
  return `INQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
};

export const createInquiryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('phone').trim().notEmpty().withMessage('Phone number is required').escape(),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('eventType').trim().notEmpty().withMessage('Event type is required').escape(),
  body('eventDate').isISO8601().toDate().withMessage('Valid event date is required'),
  body('city').trim().notEmpty().withMessage('City is required').escape(),
];

export const createInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const inquiryData = { ...req.body };
    inquiryData.inquiryNumber = generateInquiryNumber();
    
    inquiryData.timeline = [{ 
      action: 'Inquiry Created', 
      description: `Inquiry submitted via ${inquiryData.source || 'Website'}`, 
      date: new Date() 
    }];

    const newInquiry = await Inquiry.create(inquiryData);

    res.status(201).json({ status: 'success', data: newInquiry });
  } catch (error) {
    next(error);
  }
};

export const getAllInquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, status, source, priority, assignedStaff, sort = 'createdAt', order = 'desc' } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { inquiryNumber: searchRegex },
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { eventType: searchRegex },
        { city: searchRegex },
        { location: searchRegex }
      ];
    }

    if (status && status !== 'All') query.status = status;
    if (source && source !== 'All') query.source = source;
    if (priority && priority !== 'All') query.priority = priority;
    if (assignedStaff) query.assignedStaff = assignedStaff;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = { [sort as string]: sortOrder };

    const total = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .populate('assignedStaff')
      .populate('bookingId')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: inquiries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await Inquiry.findById(id);
    
    if (!existing) {
      res.status(404).json({ message: 'Inquiry not found' });
      return;
    }

    const updates = { ...req.body };
    const timeline = existing.timeline || [];

    if (updates.status && updates.status !== existing.status) {
      timeline.push({ action: 'Status Changed', description: `Status moved to ${updates.status}`, date: new Date() });
    }
    if (updates.assignedStaff && String(updates.assignedStaff) !== String(existing.assignedStaff)) {
      timeline.push({ action: 'Staff Assigned', description: `Inquiry assigned to staff member`, date: new Date() });
    }
    if (updates.followUpDate && String(updates.followUpDate) !== String(existing.followUpDate)) {
      timeline.push({ action: 'Follow-up Scheduled', description: `Follow-up set for ${new Date(updates.followUpDate).toLocaleDateString()}`, date: new Date() });
    }
    if (updates.internalNotes && updates.internalNotes !== existing.internalNotes) {
      timeline.push({ action: 'Note Added', description: `Internal note updated`, date: new Date() });
    }

    updates.timeline = timeline;

    const inquiry = await Inquiry.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('assignedStaff');

    res.status(200).json({ status: 'success', data: inquiry });
  } catch (error) {
    next(error);
  }
};

export const convertToBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findById(id);
    
    if (!inquiry) {
      res.status(404).json({ message: 'Inquiry not found' });
      return;
    }

    if (inquiry.status === InquiryStatus.CONVERTED || inquiry.bookingId) {
      res.status(400).json({ message: 'Inquiry is already converted to a booking.' });
      return;
    }

    // Generate Booking Number
    const bookingNumber = `YAZ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = new Booking({
      bookingNumber,
      clientName: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      eventType: inquiry.eventType,
      eventDate: inquiry.eventDate,
      venue: inquiry.location || inquiry.city,
      eventBudget: inquiry.budget,
      amount: inquiry.budget || 0,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      eventPriority: inquiry.priority,
      notes: inquiry.message,
      internalNotes: `Converted from Inquiry ${inquiry.inquiryNumber}. ${inquiry.internalNotes || ''}`,
      timeline: [{ action: 'Created via CRM', description: `Booking created from Inquiry ${inquiry.inquiryNumber}`, date: new Date() }]
    });

    const savedBooking = await newBooking.save();

    // Update Inquiry Status and Link Booking
    inquiry.status = InquiryStatus.CONVERTED;
    inquiry.bookingId = savedBooking._id as any;
    inquiry.timeline.push({
      action: 'Converted to Booking',
      description: `Inquiry successfully converted to Booking ${bookingNumber}`,
      date: new Date()
    });

    await inquiry.save();

    res.status(200).json({ status: 'success', data: { inquiry, booking: savedBooking } });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findByIdAndDelete(id);
    if (!inquiry) {
      res.status(404).json({ message: 'Inquiry not found' });
      return;
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateInquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ids, updateData } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ status: 'error', message: 'No IDs provided' });
      return;
    }

    await Inquiry.updateMany(
      { _id: { $in: ids } },
      { 
        $set: updateData,
        $push: { timeline: { action: 'Bulk Update', description: 'Updated via bulk action', date: new Date() } } 
      }
    );

    res.status(200).json({ status: 'success', message: 'Bulk update successful' });
  } catch (error: any) {
    next(error);
  }
};

export const bulkDeleteInquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ status: 'error', message: 'No IDs provided' });
      return;
    }

    await Inquiry.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ status: 'success', message: 'Bulk delete successful' });
  } catch (error: any) {
    next(error);
  }
};
