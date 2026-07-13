import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export type VendorData = {
  _id?: string;
  vendorCode?: string;
  businessName: string;
  ownerName: string;
  category: string;
  servicesOffered?: string[];
  primaryContact: string;
  secondaryContact?: string;
  email?: string;
  address?: string;
  city: string;
  state?: string;
  gstNumber?: string;
  experienceYears?: number;
  rating?: number;
  availabilityStatus?: 'Available' | 'Busy' | 'Unavailable';
  workingAreas?: string[];
  pricingStructure?: string;
  portfolioImages?: string[];
  contractFiles?: string[];
  documents?: any[];
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  paymentTerms?: string;
  status?: 'Active' | 'Inactive' | 'Blacklisted';
  notes?: string;
  timeline?: any[];
  bookings?: any[];
  createdAt?: string;
};

export const useVendors = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: () => api.get('/vendors', { params }),
  });
};

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: () => api.get(`/vendors/${id}`),
    enabled: !!id,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newVendor: Partial<VendorData>) => api.post('/vendors', newVendor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VendorData> }) =>
      api.patch(`/vendors/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vendors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBulkUpdateVendors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: string[], updateData: Partial<VendorData> }) => api.post('/vendors/bulk-update', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBulkDeleteVendors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: string[] }) => api.post('/vendors/bulk-delete', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
