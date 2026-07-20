import { Request, Response } from 'express';
import { MessagingService, MessagingPayload } from '../utils/messagingService';

export const sendWhatsAppNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientPhone, recipientName, title, body, messageType, metadata } = req.body;

    if (!recipientName || !body) {
      res.status(400).json({ success: false, message: 'Recipient name and message body are required' });
      return;
    }

    const payload: MessagingPayload = {
      recipientPhone,
      recipientName,
      title: title || 'Yazhi Events Notification',
      body,
      messageType: messageType || 'CUSTOM_ALERT',
      metadata,
    };

    const result = await MessagingService.sendWhatsAppAlert(payload);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch WhatsApp alert' });
  }
};

export const sendSMSNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientPhone, recipientName, title, body, messageType, metadata } = req.body;

    if (!recipientName || !body) {
      res.status(400).json({ success: false, message: 'Recipient name and body are required' });
      return;
    }

    const payload: MessagingPayload = {
      recipientPhone,
      recipientName,
      title: title || 'Yazhi Events Alert',
      body,
      messageType: messageType || 'CUSTOM_ALERT',
      metadata,
    };

    const result = await MessagingService.sendSMSAlert(payload);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch SMS alert' });
  }
};

export const sendEmailNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientEmail, recipientName, title, body, messageType, metadata } = req.body;

    const payload: MessagingPayload = {
      recipientEmail,
      recipientName,
      title: title || 'Yazhi Events Document Update',
      body,
      messageType: messageType || 'CUSTOM_ALERT',
      metadata,
    };

    const result = await MessagingService.sendEmailAlert(payload);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch email' });
  }
};
