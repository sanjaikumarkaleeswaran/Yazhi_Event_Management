import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';

export interface SendMessagePayload {
  recipientPhone?: string;
  recipientEmail?: string;
  recipientName: string;
  title?: string;
  body: string;
  messageType?: string;
  metadata?: Record<string, any>;
}

export function useCommunication() {
  const sendWhatsApp = useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const res: any = await api.post('/communication/send-whatsapp', payload);
      return res.data;
    },
  });

  const sendSMS = useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const res: any = await api.post('/communication/send-sms', payload);
      return res.data;
    },
  });

  const sendEmail = useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const res: any = await api.post('/communication/send-email', payload);
      return res.data;
    },
  });

  return {
    sendWhatsApp,
    sendSMS,
    sendEmail,
  };
}
