import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useTeam = () => {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => api.get('/team').then((res: any) => res.data),
  });
};
