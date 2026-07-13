import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface TeamFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  availabilityStatus?: string;
  employmentStatus?: string;
  sort?: string;
}

export const useTeam = (filters?: TeamFilters) => {
  return useQuery({
    queryKey: ['team', filters],
    queryFn: async () => {
      const { data } = await api.get('/team', { params: filters });
      return data;
    }
  });
};

export const useTeamMember = (id: string) => {
  return useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      const { data } = await api.get(`/team/${id}`);
      return data.data;
    },
    enabled: !!id
  });
};

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberData: any) => {
      const { data } = await api.post('/team', memberData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, memberData }: { id: string; memberData: any }) => {
      const { data } = await api.patch(`/team/${id}`, memberData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/team/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

export const useUpdateEmploymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, employmentStatus }: { id: string; employmentStatus: string }) => {
      const { data } = await api.patch(`/team/${id}/status`, { employmentStatus });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

export const useUpdateAvailabilityStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, availabilityStatus }: { id: string; availabilityStatus: string }) => {
      const { data } = await api.patch(`/team/${id}/availability`, { availabilityStatus });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};

export const useUploadTeamDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, document }: { id: string; document: { name: string; url: string } }) => {
      const { data } = await api.post(`/team/${id}/document`, document);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
    }
  });
};

export const useDeleteTeamDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, documentId }: { id: string; documentId: string }) => {
      const { data } = await api.delete(`/team/${id}/document`, { data: { documentId } });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
    }
  });
};

export const useTeamAvailabilityStats = () => {
  return useQuery({
    queryKey: ['team', 'stats', 'availability'],
    queryFn: async () => {
      const { data } = await api.get('/team/availability');
      return data.data;
    }
  });
};

export const useTeamWorkloadStats = () => {
  return useQuery({
    queryKey: ['team', 'stats', 'workload'],
    queryFn: async () => {
      const { data } = await api.get('/team/workload');
      return data.data;
    }
  });
};
