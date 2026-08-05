import api from '../../shared/api/axios';

export const getSettings = async () => {
  const response = await api.get('/settings');
  return (response as any)?.data?.settings ?? (response as any)?.settings ?? response;
};

export const updateSettings = async (payload: Record<string, unknown>) => {
  const response = await api.put('/settings', payload);
  return (response as any)?.data?.settings ?? (response as any)?.settings ?? response;
};

export const patchSettings = async (payload: Record<string, unknown>) => {
  const response = await api.patch('/settings', payload);
  return (response as any)?.data?.settings ?? (response as any)?.settings ?? response;
};

export const testEmailSettings = async () => {
  const response = await api.post('/settings/test-email');
  return response;
};

export const backupSettings = async () => {
  const response = await api.post('/settings/backup');
  return response;
};

export const restoreSettings = async () => {
  const response = await api.post('/settings/restore');
  return response;
};
