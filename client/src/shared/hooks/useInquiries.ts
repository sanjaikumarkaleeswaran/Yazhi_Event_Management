import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export type InquiryData = {
  _id?: string;
  inquiryNumber?: string;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  city: string;
  location?: string;
  message: string;
  budget?: number;
  status: 'New' | 'Contacted' | 'Qualified' | 'Quotation Sent' | 'Negotiation' | 'Converted' | 'Rejected' | 'Archived';
  source?: 'Website' | 'WhatsApp' | 'Phone' | 'Instagram' | 'Facebook' | 'Referral' | 'Walk-in';
  priority?: 'Low' | 'Medium' | 'High';
  assignedStaff?: any;
  followUpDate?: string;
  internalNotes?: string;
  bookingId?: string;
  timeline?: any[];
  attachments?: any[];
  createdAt?: string;
};

export const useInquiries = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['inquiries', params],
    queryFn: () => api.get('/inquiries', { params }),
  });
};

export const useCreateInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newInquiry: Partial<InquiryData>) => api.post('/inquiries', newInquiry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InquiryData> }) =>
      api.patch(`/inquiries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/inquiries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBulkUpdateInquiries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: string[], updateData: Partial<InquiryData> }) => api.post('/inquiries/bulk-update', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBulkDeleteInquiries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: string[] }) => api.post('/inquiries/bulk-delete', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useConvertInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/inquiries/${id}/convert`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};
