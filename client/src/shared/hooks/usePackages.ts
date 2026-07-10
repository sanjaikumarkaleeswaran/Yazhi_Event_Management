import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const usePackages = (eventType?: string) => {
  return useQuery({
    queryKey: ['packages', eventType],
    queryFn: () => api.get('/packages', { params: { eventType } }).then((res: any) => res.data),
  });
};
