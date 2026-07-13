import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export const useAnalyticsOverview = (filters?: DateFilter) => {
  return useQuery({
    queryKey: ['analytics', 'overview', filters],
    queryFn: async () => {
      const { data } = await api.get('/analytics/overview', { params: filters });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useBookingAnalytics = (filters?: DateFilter) => {
  return useQuery({
    queryKey: ['analytics', 'bookings', filters],
    queryFn: async () => {
      const { data } = await api.get('/analytics/bookings', { params: filters });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useInquiryAnalytics = (filters?: DateFilter) => {
  return useQuery({
    queryKey: ['analytics', 'inquiries', filters],
    queryFn: async () => {
      const { data } = await api.get('/analytics/inquiries', { params: filters });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientAnalytics = (filters?: DateFilter) => {
  return useQuery({
    queryKey: ['analytics', 'clients', filters],
    queryFn: async () => {
      const { data } = await api.get('/analytics/clients', { params: filters });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useVendorAnalytics = (filters?: DateFilter) => {
  return useQuery({
    queryKey: ['analytics', 'vendors', filters],
    queryFn: async () => {
      const { data } = await api.get('/analytics/vendors', { params: filters });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
