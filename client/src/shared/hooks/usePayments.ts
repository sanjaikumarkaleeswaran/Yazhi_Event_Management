import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface PaymentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  gateway?: string;
}

export const usePayments = (filters?: PaymentFilters) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const { data } = await api.get('/payments', { params: filters });
      return data;
    }
  });
};

export const useCreateManualPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentData: any) => {
      const { data } = await api.post('/payments', paymentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};

export const useCreateRazorpayOrder = () => {
  return useMutation({
    mutationFn: async (orderData: { bookingId: string; amount: number; clientId: string }) => {
      const { data } = await api.post('/payments/razorpay/create-order', orderData);
      return data;
    }
  });
};

export const useVerifyRazorpayPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (verificationData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      payment_id: string;
    }) => {
      const { data } = await api.post('/payments/razorpay/verify', verificationData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/payments/${id}/refund`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};
