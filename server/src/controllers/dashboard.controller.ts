import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Inquiry from '../models/Inquiry';
import GalleryItem from '../models/GalleryItem';
import Testimonial from '../models/Testimonial';
import User from '../models/User';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    
    // 1. Stats
    const totalRevenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['Confirmed', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    
    const activeBookings = await Booking.countDocuments({ status: { $in: ['Pending', 'Confirmed'] } } as any);
    const newInquiries = await Inquiry.countDocuments({ status: 'New' } as any);
    const eventsDone = await Booking.countDocuments({ status: 'Completed' } as any);
    
    // Total Clients - approximate by counting unique emails in bookings
    const uniqueClientsResult = await Booking.aggregate([
      { $group: { _id: '$email' } },
      { $count: 'total' }
    ]);
    const totalClients = uniqueClientsResult[0]?.total || 0;
    
    const galleryItems = await GalleryItem.countDocuments();
    const testimonials = await Testimonial.countDocuments();
    
    // 2. Upcoming Events (Next 5)
    const upcomingEvents = await Booking.find({ 
      eventDate: { $gte: today },
      status: { $in: ['Confirmed', 'Pending'] }
    } as any).sort({ eventDate: 1 }).limit(5);
    
    // 3. Recent Activity (Merge recent bookings and inquiries)
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(3);
    const recentInquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(3);
    
    const recentActivity = [
      ...recentBookings.map(b => ({
        id: `b-${b._id}`,
        type: 'booking',
        text: `Booking ${b.status}: ${b.clientName}`,
        sub: `${b.eventType} · ${new Date(b.eventDate).toLocaleDateString()}`,
        time: b.createdAt,
        color: b.status === 'Confirmed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
      })),
      ...recentInquiries.map(i => ({
        id: `i-${i._id}`,
        type: 'inquiry',
        text: `New inquiry from ${i.name}`,
        sub: `${i.eventType} · ${i.city}`,
        time: i.createdAt,
        color: 'bg-violet-100 text-violet-600'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    // 4. Revenue Chart Data (Current Year by Month)
    const currentYear = today.getFullYear();
    const revenueByMonth = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['Confirmed', 'Completed'] },
          eventDate: { 
            $gte: new Date(`${currentYear}-01-01`), 
            $lte: new Date(`${currentYear}-12-31`) 
          }
        } 
      },
      {
        $group: {
          _id: { $month: '$eventDate' },
          revenue: { $sum: '$amount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = months.map((month, index) => {
      const data = revenueByMonth.find(r => r._id === index + 1);
      return {
        month,
        revenue: data ? data.revenue : 0,
        bookings: data ? data.bookings : 0
      };
    });

    // 5. Event Types Distribution
    const eventTypesResult = await Booking.aggregate([
      { $group: { _id: '$eventType', value: { $sum: 1 } } },
      { $sort: { value: -1 } }
    ]);
    
    const colors = ['#C89B3C', '#5A1E1E', '#3B82F6', '#6B7280', '#10B981'];
    const eventTypes = eventTypesResult.map((e, index) => ({
      name: e._id,
      value: e.value,
      color: colors[index % colors.length]
    }));

    // 6. Weekly Inquiries (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const inquiriesLast7Days = await Inquiry.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } }
    ]);
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const inquiryData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - 6 + i); // 6 days ago up to today
      const dayIndex = d.getDay(); // 0 (Sun) to 6 (Sat)
      const data = inquiriesLast7Days.find(r => r._id === dayIndex + 1); // MongoDB dayOfWeek is 1-7 (Sun-Sat)
      return {
        day: daysOfWeek[dayIndex],
        count: data ? data.count : 0
      };
    });

    res.status(200).json({
      stats: {
        totalRevenue,
        activeBookings,
        newInquiries,
        eventsDone,
        totalClients,
        galleryItems,
        testimonials,
        pendingTasks: 0 // Will connect when Tasks module is built
      },
      upcomingEvents,
      recentActivity,
      revenueData,
      eventTypes,
      inquiryData
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard data' });
  }
};
