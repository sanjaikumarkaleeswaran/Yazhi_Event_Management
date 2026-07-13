import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import Inquiry from '../models/Inquiry';
import Client from '../models/Client';
import Vendor from '../models/Vendor';
import mongoose from 'mongoose';

// Utility to parse date ranges from query
const getDateRange = (req: Request) => {
  const { startDate, endDate } = req.query;
  const matchQuery: any = {};
  
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }
  return matchQuery;
};

const getEventDateRange = (req: Request) => {
  const { startDate, endDate } = req.query;
  const matchQuery: any = {};
  
  if (startDate && endDate) {
    matchQuery.eventDate = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }
  return matchQuery;
};

export const getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dateQuery = getDateRange(req);
    const eventDateQuery = getEventDateRange(req);

    // Total Revenue (Only Confirmed/Completed Bookings)
    const revenueMatch = { status: { $in: ['Confirmed', 'Completed'] }, ...dateQuery };
    const revenueData = await Booking.aggregate([
      { $match: revenueMatch as any },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    
    const totalRevenue = revenueData[0]?.total || 0;
    const totalBookings = revenueData[0]?.count || 0;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const activeClients = await Client.countDocuments({ status: 'Active', ...dateQuery } as any);
    const activeVendors = await Vendor.countDocuments({ status: 'Active', ...dateQuery } as any);
    
    const openInquiries = await Inquiry.countDocuments({ 
      status: { $in: ['New', 'Contacted', 'Qualified', 'Proposal Sent'] },
      ...dateQuery 
    } as any);

    // Conversion rate
    const totalInquiries = await Inquiry.countDocuments(dateQuery as any);
    const convertedInquiries = await Inquiry.countDocuments({ status: 'Converted', ...dateQuery } as any);
    const conversionRate = totalInquiries > 0 ? ((convertedInquiries / totalInquiries) * 100).toFixed(1) : 0;

    const now = new Date();
    const upcomingEvents = await Booking.countDocuments({ eventDate: { $gte: now }, status: { $in: ['Confirmed', 'Pending'] } } as any);
    const completedEvents = await Booking.countDocuments({ status: 'Completed', ...dateQuery } as any);
    const cancelledEvents = await Booking.countDocuments({ status: 'Cancelled', ...dateQuery } as any);

    res.status(200).json({
      status: 'success',
      data: {
        totalRevenue,
        totalBookings,
        activeClients,
        activeVendors,
        openInquiries,
        conversionRate,
        upcomingEvents,
        completedEvents,
        cancelledEvents,
        averageBookingValue
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dateQuery = getDateRange(req);

    // Bookings by Month
    const bookingsByMonth = await Booking.aggregate([
      { $match: dateQuery as any },
      { 
        $group: { 
          _id: { $month: '$createdAt' }, 
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedByMonth = months.map((month, idx) => {
      const data = bookingsByMonth.find(b => b._id === idx + 1);
      return { month, revenue: data?.revenue || 0, bookings: data?.count || 0 };
    });

    // Bookings by Event Type
    const bookingsByType = await Booking.aggregate([
      { $match: dateQuery as any },
      { $group: { _id: '$eventType', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { count: -1 } }
    ]);

    // Bookings by Status
    const bookingsByStatus = await Booking.aggregate([
      { $match: dateQuery as any },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top Cities (assume venue contains city or use clients)
    // Client city is in Client model, but we don't have city in Booking directly except venue.
    // Let's group by venue if possible or skip.

    res.status(200).json({
      status: 'success',
      data: {
        byMonth: formattedByMonth,
        byType: bookingsByType.map(b => ({ name: b._id, value: b.count, revenue: b.revenue })),
        byStatus: bookingsByStatus.map(b => ({ name: b._id, value: b.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiryAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dateQuery = getDateRange(req);

    const sourceDistribution = await Inquiry.aggregate([
      { $match: dateQuery as any },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const statusDistribution = await Inquiry.aggregate([
      { $match: dateQuery as any },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Funnel: Total -> Qualified -> Proposal Sent -> Converted
    const funnelStages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Lost'];
    const funnelData = funnelStages.map(stage => {
      const data = statusDistribution.find(s => s._id === stage);
      return { name: stage, value: data?.count || 0 };
    });

    res.status(200).json({
      status: 'success',
      data: {
        bySource: sourceDistribution.map(s => ({ name: s._id || 'Direct', value: s.count })),
        funnel: funnelData,
        byStatus: statusDistribution.map(s => ({ name: s._id, value: s.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getClientAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dateQuery = getDateRange(req);

    const clientsByStatus = await Client.aggregate([
      { $match: dateQuery as any },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Growth over months
    const clientGrowth = await Client.aggregate([
      { $match: dateQuery as any },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedGrowth = months.map((month, idx) => {
      const data = clientGrowth.find(c => c._id === idx + 1);
      return { month, clients: data?.count || 0 };
    });

    res.status(200).json({
      status: 'success',
      data: {
        byStatus: clientsByStatus.map(c => ({ name: c._id, value: c.count })),
        growth: formattedGrowth
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dateQuery = getDateRange(req);

    const vendorDistribution = await Vendor.aggregate([
      { $match: dateQuery as any },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const availability = await Vendor.aggregate([
      { $match: dateQuery as any },
      { $group: { _id: '$availabilityStatus', count: { $sum: 1 } } }
    ]);

    // Most assigned vendors
    const assignedVendors = await Booking.aggregate([
      { $match: dateQuery as any },
      { $unwind: '$assignedVendors' },
      { $group: { _id: '$assignedVendors', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorDetails'
        }
      },
      { $unwind: '$vendorDetails' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        byCategory: vendorDistribution.map(v => ({ name: v._id, value: v.count })),
        availability: availability.map(a => ({ name: a._id, value: a.count })),
        topVendors: assignedVendors.map(v => ({
          id: v._id,
          name: v.vendorDetails.businessName,
          category: v.vendorDetails.category,
          assignments: v.count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
