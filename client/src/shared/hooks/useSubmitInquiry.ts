import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';

export interface InquiryPayload {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  city: string;
  message: string;
}

export const useSubmitInquiry = () => {
  return useMutation({
    mutationFn: (data: InquiryPayload) => api.post('/inquiries', data),
  });
};
