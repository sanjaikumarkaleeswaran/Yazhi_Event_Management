import api from './axios';

export const uploadImage = async (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  const response: any = await api.post('/blog/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const replaceImage = async (file: File, publicId: string) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('publicId', publicId);
  const response: any = await api.post('/blog/upload/replace', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const deleteImage = async (publicId: string) => {
  const response: any = await api.delete(`/blog/upload/${encodeURIComponent(publicId)}`);
  return response;
};
