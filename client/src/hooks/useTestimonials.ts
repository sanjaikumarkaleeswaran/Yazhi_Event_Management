import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: () => api.get('/testimonials').then((res: any) => res.data),
  });
};
