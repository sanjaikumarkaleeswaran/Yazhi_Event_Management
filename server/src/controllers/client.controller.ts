import { Request, Response, NextFunction } from 'express';
import Client from '../models/Client';
import Booking from '../models/Booking';
import Inquiry from '../models/Inquiry';

const generateClientCode = () => {
  return `CLI-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
};

export const createClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = { ...req.body };
    data.clientCode = generateClientCode();
    data.timeline = [{ action: 'Client Created', description: 'Added to CRM manually', date: new Date() }];

    const client = await Client.create(data);
    res.status(201).json({ status: 'success', data: client });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, status, isVIP, city, sort = 'createdAt', order = 'desc' } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { clientCode: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { city: searchRegex }
      ];
    }

    if (status && status !== 'All') query.status = status;
    if (isVIP && isVIP !== 'All') query.isVIP = isVIP === 'true';
    if (city && city !== 'All') query.city = new RegExp(city as string, 'i');

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = { [sort as string]: sortOrder };

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: clients,
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

export const getClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    // Fetch related bookings and inquiries for the profile view
    // Assuming bookings and inquiries might match by email or phone since clientId might not be perfectly mapped in legacy docs
    const bookings = await Booking.find({ 
      $or: [{ email: client.email }, { phone: client.phone }] 
    }).sort({ createdAt: -1 });

    const inquiries = await Inquiry.find({
      $or: [{ email: client.email }, { phone: client.phone }]
    }).sort({ createdAt: -1 });

    res.status(200).json({ 
      status: 'success', 
      data: {
        ...client.toObject(),
        bookings,
        inquiries
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await Client.findById(id);
    if (!existing) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    const updates = { ...req.body };
    const timeline = existing.timeline || [];

    timeline.push({ action: 'Profile Updated', description: 'Client profile was modified', date: new Date() });
    updates.timeline = timeline;

    const client = await Client.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    res.status(200).json({ status: 'success', data: client });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ids, updateData } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ status: 'error', message: 'No IDs provided' });
      return;
    }

    await Client.updateMany(
      { _id: { $in: ids } },
      { 
        $set: updateData,
        $push: { timeline: { action: 'Bulk Update', description: 'Updated via bulk action', date: new Date() } } 
      }
    );

    res.status(200).json({ status: 'success', message: 'Bulk update successful' });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ status: 'error', message: 'No IDs provided' });
      return;
    }

    await Client.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ status: 'success', message: 'Bulk delete successful' });
  } catch (error) {
    next(error);
  }
};
