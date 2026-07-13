import { Request, Response } from 'express';
import Booking from '../models/Booking';
import TeamMember from '../models/TeamMember';
import { 
  dispatchBookingCreated, 
  dispatchBookingUpdated, 
  dispatchBookingCancelled, 
  dispatchTeamAssigned 
} from '../utils/notificationDispatcher';

// Generate Unique Booking Number
const generateBookingNumber = () => {
  const prefix = 'YAZ';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, status, paymentStatus, eventPriority, assignedVendor, assignedTeam, sort = 'createdAt', order = 'desc' } = req.query;

    const query: any = {};

    // Search
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { bookingNumber: searchRegex },
        { clientName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { venue: searchRegex },
        { eventType: searchRegex }
      ];
    }

    // Filters
    if (status && status !== 'All') query.status = status;
    if (paymentStatus && paymentStatus !== 'All') query.paymentStatus = paymentStatus;
    if (eventPriority && eventPriority !== 'All') query.eventPriority = eventPriority;
    if (assignedVendor) query.assignedVendors = assignedVendor;
    if (assignedTeam) query.assignedTeam = assignedTeam;

    // Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = { [sort as string]: sortOrder };

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('assignedTeam')
      .populate('assignedVendors')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Error fetching bookings' });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const email = (req as any).user?.email;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'User email not found' });
    }
    const bookings = await Booking.find({ email })
      .populate('assignedTeam')
      .populate('assignedVendors')
      .sort({ createdAt: -1 });
    res.status(200).json({ data: bookings });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching your bookings' });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = { ...req.body };
    if (!bookingData.bookingNumber) {
      bookingData.bookingNumber = generateBookingNumber();
    }
    
    bookingData.timeline = [{ 
      action: 'Created', 
      description: 'Booking created successfully', 
      date: new Date() 
    }];

    // Validate assigned team if provided
    if (bookingData.assignedTeam && bookingData.assignedTeam.length > 0) {
      const targetDate = new Date(bookingData.eventDate);
      const startOfDay = new Date(targetDate.setHours(0,0,0,0));
      const endOfDay = new Date(targetDate.setHours(23,59,59,999));

      for (const memberId of bookingData.assignedTeam) {
        const member = await TeamMember.findById(memberId);
        if (!member) {
          return res.status(404).json({ status: 'error', message: `Team member ${memberId} not found` });
        }
        if (member.availabilityStatus !== 'Available') {
          return res.status(400).json({ 
            status: 'error', 
            message: `Employee ${member.firstName} ${member.lastName} is not available (Status: ${member.availabilityStatus})` 
          });
        }

        // Check for overlaps
        const overlap = await Booking.findOne({
          eventDate: { $gte: startOfDay, $lte: endOfDay },
          assignedTeam: memberId,
          status: { $in: ['Confirmed', 'Pending'] }
        } as any);
        if (overlap) {
          return res.status(400).json({
            status: 'error',
            message: `Employee ${member.firstName} ${member.lastName} has an overlapping booking (${overlap.bookingNumber}) on this date.`
          });
        }
      }
    }

    const newBooking = new Booking(bookingData);
    const savedBooking = await newBooking.save();

    // Dispatch booking created notification
    await dispatchBookingCreated(savedBooking);

    // Update team members assignedBookings & timeline
    if (bookingData.assignedTeam && bookingData.assignedTeam.length > 0) {
      for (const memberId of bookingData.assignedTeam) {
        const member = await TeamMember.findByIdAndUpdate(memberId, {
          $addToSet: { assignedBookings: savedBooking._id },
          $push: {
            timeline: {
              action: 'Assigned',
              description: `Assigned to booking ${savedBooking.bookingNumber}`,
              date: new Date()
            }
          }
        }, { new: true });
        
        if (member) {
          await dispatchTeamAssigned(savedBooking, member);
        }
      }
    }

    res.status(201).json(savedBooking);
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message || 'Error creating booking' });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const existing = await Booking.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    const updates = { ...req.body };
    const timeline = existing.timeline || [];

    // Track Changes
    if (updates.status && updates.status !== existing.status) {
      timeline.push({ action: 'Status Updated', description: `Status changed to ${updates.status}`, date: new Date() });
    }
    if (updates.paymentStatus && updates.paymentStatus !== existing.paymentStatus) {
      timeline.push({ action: 'Payment Updated', description: `Payment status changed to ${updates.paymentStatus}`, date: new Date() });
    }
    if (updates.assignedVendors && updates.assignedVendors.length > (existing.assignedVendors?.length || 0)) {
      timeline.push({ action: 'Vendor Assigned', description: 'New vendor assigned to event', date: new Date() });
    }
    if (updates.assignedTeam && updates.assignedTeam.length > (existing.assignedTeam?.length || 0)) {
      timeline.push({ action: 'Team Assigned', description: 'Team member assigned to event', date: new Date() });
    }
    if (updates.documents && updates.documents.length > (existing.documents?.length || 0)) {
      timeline.push({ action: 'Document Uploaded', description: 'New document added', date: new Date() });
    }

    // Sync team members if assignedTeam is changed
    if (updates.assignedTeam) {
      const oldTeam = existing.assignedTeam?.map(id => id.toString()) || [];
      const newTeam = updates.assignedTeam.map((id: any) => id.toString());
      
      const addedTeam = newTeam.filter((id: string) => !oldTeam.includes(id));
      const removedTeam = oldTeam.filter((id: string) => !newTeam.includes(id));

      const targetDate = updates.eventDate ? new Date(updates.eventDate) : existing.eventDate;
      const startOfDay = new Date(new Date(targetDate).setHours(0,0,0,0));
      const endOfDay = new Date(new Date(targetDate).setHours(23,59,59,999));

      // Validate added team members
      for (const memberId of addedTeam) {
        const member = await TeamMember.findById(memberId);
        if (!member) {
          return res.status(404).json({ status: 'error', message: `Team member ${memberId} not found` });
        }
        if (member.availabilityStatus !== 'Available') {
          return res.status(400).json({
            status: 'error',
            message: `Employee ${member.firstName} ${member.lastName} is not available (Status: ${member.availabilityStatus})`
          });
        }

        // Check for overlaps
        const overlap = await Booking.findOne({
          _id: { $ne: existing._id },
          eventDate: { $gte: startOfDay, $lte: endOfDay },
          assignedTeam: memberId,
          status: { $in: ['Confirmed', 'Pending'] }
        } as any);
        if (overlap) {
          return res.status(400).json({
            status: 'error',
            message: `Employee ${member.firstName} ${member.lastName} has an overlapping booking (${overlap.bookingNumber}) on this date.`
          });
        }
      }

      // Sync database updates for added team
      for (const memberId of addedTeam) {
        const member = await TeamMember.findByIdAndUpdate(memberId, {
          $addToSet: { assignedBookings: existing._id },
          $push: {
            timeline: {
              action: 'Assigned',
              description: `Assigned to booking ${existing.bookingNumber}`,
              date: new Date()
            }
          }
        }, { new: true });
        
        if (member) {
          await dispatchTeamAssigned(existing, member);
        }
      }

      // Sync database updates for removed team
      for (const memberId of removedTeam) {
        await TeamMember.findByIdAndUpdate(memberId, {
          $pull: { assignedBookings: existing._id },
          $push: {
            timeline: {
              action: 'Removed',
              description: `Removed from booking ${existing.bookingNumber}`,
              date: new Date()
            }
          }
        });
      }
    }

    updates.timeline = timeline;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('assignedTeam')
    .populate('assignedVendors');

    if (updatedBooking) {
      if (updatedBooking.status === 'Cancelled') {
        await dispatchBookingCancelled(updatedBooking);
      } else {
        await dispatchBookingUpdated(updatedBooking);
      }
    }
    
    res.status(200).json(updatedBooking);
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message || 'Error updating booking' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    // Pull booking reference from all team members
    await TeamMember.updateMany(
      { assignedBookings: req.params.id } as any,
      { 
        $pull: { assignedBookings: req.params.id },
        $push: {
          timeline: {
            action: 'Booking Cancelled/Deleted',
            description: `Assigned booking ${deletedBooking.bookingNumber} was deleted`,
            date: new Date()
          }
        }
      } as any
    );

    await dispatchBookingCancelled(deletedBooking);

    res.status(200).json({ status: 'success', message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error deleting booking' });
  }
};

export const bulkUpdateBookings = async (req: Request, res: Response) => {
  try {
    const { ids, updateData } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No IDs provided' });
    }

    const timelineEntry = {
      action: 'Bulk Update',
      description: 'Updated via bulk action',
      date: new Date()
    };

    await Booking.updateMany(
      { _id: { $in: ids } },
      { 
        $set: updateData,
        $push: { timeline: timelineEntry } 
      }
    );

    res.status(200).json({ status: 'success', message: 'Bulk update successful' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Bulk update failed' });
  }
};

export const bulkDeleteBookings = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No IDs provided' });
    }

    // Pull booking references from all team members before deleting
    await TeamMember.updateMany(
      { assignedBookings: { $in: ids } },
      { $pull: { assignedBookings: { $in: ids } } }
    );

    await Booking.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ status: 'success', message: 'Bulk delete successful' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Bulk delete failed' });
  }
};
