import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backupSettings, getSettings, patchSettings, restoreSettings, testEmailSettings, updateSettings } from '../services/settingsService';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateSettings(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const usePatchSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => patchSettings(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useTestEmailSettings = () => {
  return useMutation({ mutationFn: testEmailSettings });
};

export const useBackupSettings = () => {
  return useMutation({ mutationFn: backupSettings });
};

export const useRestoreSettings = () => {
  return useMutation({ mutationFn: restoreSettings });
};
