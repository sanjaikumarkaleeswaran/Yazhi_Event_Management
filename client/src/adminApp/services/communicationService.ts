import api from '../../shared/api/axios';

export interface CommunicationQuery { page?: number; limit?: number; search?: string; status?: string; type?: string; sort?: string; order?: string; }
export interface CommunicationPayload { recipientName: string; recipientEmail?: string; recipientPhone?: string; subject?: string; message: string; template?: string; bookingId?: string; clientId?: string; inquiryId?: string; }

export const getCommunications = async (query: CommunicationQuery = {}) => api.get('/communication', { params: query });
export const getCommunication = async (id: string) => api.get(`/communication/${id}`);
export const sendEmail = async (payload: CommunicationPayload) => api.post('/communication/email', payload);
export const sendSMS = async (payload: CommunicationPayload) => api.post('/communication/sms', payload);
export const sendWhatsApp = async (payload: CommunicationPayload) => api.post('/communication/whatsapp', payload);
export const bulkSend = async (payload: { type: string; messages: CommunicationPayload[] }) => api.post('/communication/bulk', payload);
export const deleteCommunication = async (id: string) => api.delete(`/communication/${id}`);
export const resendCommunication = async (id: string) => api.post(`/communication/${id}/resend`);
