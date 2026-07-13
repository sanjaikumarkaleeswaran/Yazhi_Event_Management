import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export interface DashboardData {
  stats: {
    totalRevenue: number;
    activeBookings: number;
    newInquiries: number;
    eventsDone: number;
    totalClients: number;
    galleryItems: number;
    testimonials: number;
    pendingTasks: number;
  };
  upcomingEvents: Array<{
    _id: string;
    clientName: string;
    eventDate: string;
    eventType: string;
    status: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    text: string;
    sub: string;
    time: string;
    color: string;
  }>;
  revenueData: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  eventTypes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  inquiryData: Array<{
    day: string;
    count: number;
  }>;
}

export const useDashboard = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard'),
  });
};
