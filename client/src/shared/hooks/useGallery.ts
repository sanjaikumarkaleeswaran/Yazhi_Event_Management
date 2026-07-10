import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useGallery = (eventType?: string) => {
  return useQuery({
    queryKey: ['gallery', eventType],
    queryFn: () => api.get('/gallery', { params: { eventType } }).then((res: any) => res.data),
  });
};
