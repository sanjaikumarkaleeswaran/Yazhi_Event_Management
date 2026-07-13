import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export type BookingData = {
  _id?: string;
  bookingNumber?: string;
  clientName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  venue?: string;
  packageName?: string;
  guestCount?: number;
  eventBudget?: number;
  amount: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Rescheduled';
  paymentStatus?: 'Pending' | 'Partially Paid' | 'Paid' | 'Refunded';
  eventPriority?: 'Low' | 'Medium' | 'High';
  notes?: string;
  internalNotes?: string;
  invoiceReference?: string;
  reminderDates?: string[];
  assignedTeam?: any[];
  assignedVendors?: any[];
  documents?: any[];
  timeline?: any[];
  createdAt?: string;
};

export const useBookings = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => api.get('/bookings', { params }),
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my-bookings'),
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBooking: BookingData) => api.post('/bookings', newBooking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BookingData> }) =>
      api.patch(`/bookings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBulkUpdateBookings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: string[], updateData: Partial<BookingData> }) => api.post('/bookings/bulk-update', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBulkDeleteBookings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: string[] }) => api.post('/bookings/bulk-delete', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
