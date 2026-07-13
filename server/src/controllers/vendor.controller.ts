import { Request, Response, NextFunction } from 'express';
import Vendor, { VendorStatus } from '../models/Vendor';
import Booking from '../models/Booking';

const generateVendorCode = () => {
  return `VND-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
};

export const createVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = { ...req.body };
    data.vendorCode = generateVendorCode();
    data.timeline = [{ action: 'Vendor Created', description: 'Vendor added to resource database', date: new Date() }];

    const vendor = await Vendor.create(data);
    res.status(201).json({ status: 'success', data: vendor });
  } catch (error) {
    next(error);
  }
};

export const getVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, category, city, availabilityStatus, status, sort = 'createdAt', order = 'desc' } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { vendorCode: searchRegex },
        { businessName: searchRegex },
        { ownerName: searchRegex },
        { primaryContact: searchRegex },
        { email: searchRegex },
      ];
    }

    if (category && category !== 'All') query.category = category;
    if (city && city !== 'All') query.city = new RegExp(city as string, 'i');
    if (availabilityStatus && availabilityStatus !== 'All') query.availabilityStatus = availabilityStatus;
    if (status && status !== 'All') query.status = status;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = { [sort as string]: sortOrder };

    const total = await Vendor.countDocuments(query);
    const vendors = await Vendor.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: vendors,
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

export const getVendorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    // Fetch related bookings where this vendor is assigned
    const bookings = await Booking.find({ assignedVendors: id } as any).sort({ createdAt: -1 });

    res.status(200).json({ 
      status: 'success', 
      data: {
        ...vendor.toObject(),
        bookings
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await Vendor.findById(id);
    if (!existing) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    const updates = { ...req.body };
    const timeline = existing.timeline || [];

    if (updates.status && updates.status !== existing.status) {
      timeline.push({ action: 'Status Updated', description: `Status changed to ${updates.status}`, date: new Date() });
    }
    if (updates.availabilityStatus && updates.availabilityStatus !== existing.availabilityStatus) {
      timeline.push({ action: 'Availability Updated', description: `Availability changed to ${updates.availabilityStatus}`, date: new Date() });
    }

    timeline.push({ action: 'Profile Updated', description: 'Vendor profile was modified', date: new Date() });
    updates.timeline = timeline;

    const vendor = await Vendor.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    res.status(200).json({ status: 'success', data: vendor });
  } catch (error) {
    next(error);
  }
};

export const deleteVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if vendor is assigned to any bookings
    const activeBookingsCount = await Booking.countDocuments({ assignedVendors: id } as any);
    if (activeBookingsCount > 0) {
      res.status(400).json({ 
        status: 'error', 
        message: `Cannot delete vendor. They are currently assigned to ${activeBookingsCount} bookings.` 
      });
      return;
    }

    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ids, updateData } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ status: 'error', message: 'No IDs provided' });
      return;
    }

    await Vendor.updateMany(
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

export const bulkDeleteVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ status: 'error', message: 'No IDs provided' });
      return;
    }
    
    // Advanced: We should theoretically check if ANY of these vendors have active bookings before deleting
    // For now, we will perform a force delete on the array
    await Vendor.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ status: 'success', message: 'Bulk delete successful' });
  } catch (error) {
    next(error);
  }
};
