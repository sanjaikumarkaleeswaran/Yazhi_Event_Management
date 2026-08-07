import { Request, Response, NextFunction } from 'express';
import Communication from '../models/Communication';
import { CommunicationInput, deliverCommunication, resendCommunication } from '../utils/communicationService';

const inputFromRequest = (req: Request, type: CommunicationInput['type']): CommunicationInput => ({ ...req.body, type, sentBy: (req as any).user?._id?.toString() });

export const getCommunications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const query: any = {};
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status;
    if (req.query.type && req.query.type !== 'All') query.type = req.query.type;
    if (req.query.clientId) query.clientId = req.query.clientId;
    if (req.query.from || req.query.to) query.createdAt = { ...(req.query.from ? { $gte: new Date(String(req.query.from)) } : {}), ...(req.query.to ? { $lte: new Date(String(req.query.to)) } : {}) };
    if (req.query.search) {
      const search = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ recipientName: search }, { recipientEmail: search }, { recipientPhone: search }, { subject: search }, { message: search }];
    }
    const sortField = ['createdAt', 'sentAt', 'recipientName', 'status', 'type'].includes(String(req.query.sort)) ? String(req.query.sort) : 'createdAt';
    const sort = req.query.order === 'asc' ? 1 : -1;
    const [communications, total] = await Promise.all([
      Communication.find(query).populate('clientId bookingId inquiryId').sort({ [sortField]: sort }).skip((page - 1) * limit).limit(limit).lean(),
      Communication.countDocuments(query),
    ]);
    res.json({ status: 'success', data: communications, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getCommunication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const communication = await Communication.findById(req.params.id).populate('clientId bookingId inquiryId sentBy');
    if (!communication) { res.status(404).json({ status: 'error', message: 'Communication not found' }); return; }
    res.json({ status: 'success', data: communication });
  } catch (error) { next(error); }
};

const send = (type: CommunicationInput['type']) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { res.status(201).json({ status: 'success', data: await deliverCommunication(inputFromRequest(req, type)) }); } catch (error) { next(error); }
};

export const sendEmail = send('Email');
export const sendSMS = send('SMS');
export const sendWhatsApp = send('WhatsApp');

export const bulkSend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messages = [], type } = req.body;
    if (!Array.isArray(messages) || messages.length > 100 || !['Email', 'SMS', 'WhatsApp'].includes(type)) { res.status(400).json({ status: 'error', message: 'A valid type and up to 100 messages are required' }); return; }
    const results = await Promise.all(messages.map((message: Record<string, unknown>) => deliverCommunication({ ...message, type, sentBy: (req as any).user?._id?.toString() } as CommunicationInput)));
    res.status(201).json({ status: 'success', data: results });
  } catch (error) { next(error); }
};

export const deleteCommunication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const deleted = await Communication.findByIdAndDelete(req.params.id); if (!deleted) { res.status(404).json({ status: 'error', message: 'Communication not found' }); return; } res.json({ status: 'success', message: 'Communication deleted' }); } catch (error) { next(error); }
};

export const resend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const communication = await Communication.findById(req.params.id); if (!communication) { res.status(404).json({ status: 'error', message: 'Communication not found' }); return; } res.status(201).json({ status: 'success', data: await resendCommunication(communication) }); } catch (error) { next(error); }
};

export const sendWhatsAppNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientPhone, recipientName, title, body, messageType, metadata } = req.body;

    if (!recipientName || !body) {
      res.status(400).json({ success: false, message: 'Recipient name and message body are required' });
      return;
    }

    const result = await deliverCommunication({ type: 'WhatsApp', recipientPhone, recipientName, subject: title, message: body, template: messageType, ...metadata });
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

    const result = await deliverCommunication({ type: 'SMS', recipientPhone, recipientName, subject: title, message: body, template: messageType, ...metadata });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch SMS alert' });
  }
};

export const sendEmailNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientEmail, recipientName, title, body, messageType, metadata } = req.body;

    const result = await deliverCommunication({ type: 'Email', recipientEmail, recipientName, subject: title, message: body, template: messageType, ...metadata });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch email' });
  }
};
