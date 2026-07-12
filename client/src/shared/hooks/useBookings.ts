import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export type BookingData = {
  clientName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  venue?: string;
  packageName?: string;
  amount: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes?: string;
};

export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings').then((res: any) => res.data),
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my-bookings').then((res: any) => res.data),
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBooking: BookingData) => api.post('/bookings', newBooking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
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
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
