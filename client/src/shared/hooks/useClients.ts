import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export type ClientData = {
  _id?: string;
  clientCode?: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dob?: string;
  anniversary?: string;
  profilePhoto?: string;
  company?: string;
  preferredLanguage?: string;
  preferredContactMethod?: 'Email' | 'Phone' | 'WhatsApp';
  tags?: string[];
  isVIP?: boolean;
  notes?: string;
  status?: 'Active' | 'Inactive' | 'Lead';
  customerSince?: string;
  timeline?: any[];
  bookings?: any[];
  inquiries?: any[];
  createdAt?: string;
};

export const useClients = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => api.get('/clients', { params }),
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => api.get(`/clients/${id}`),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newClient: Partial<ClientData>) => api.post('/clients', newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientData> }) =>
      api.patch(`/clients/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBulkUpdateClients = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: string[], updateData: Partial<ClientData> }) => api.post('/clients/bulk-update', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBulkDeleteClients = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: string[] }) => api.post('/clients/bulk-delete', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
