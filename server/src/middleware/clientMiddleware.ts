import { Response, NextFunction } from 'express';
import Client from '../models/Client';
import { AuthRequest } from './authMiddleware';

export interface ClientRequest extends AuthRequest {
  client?: any;
}

export const resolveClient = async (req: ClientRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Client') {
      res.status(403).json({ status: 'error', message: 'Client access is required' });
      return;
    }

    const client = req.user.clientId
      ? await Client.findById(req.user.clientId)
      : await Client.findOne({ email: req.user.email.toLowerCase() });

    if (!client) {
      res.status(403).json({ status: 'error', message: 'No client profile is linked to this account' });
      return;
    }

    if (!req.user.clientId) {
      await req.user.updateOne({ $set: { clientId: client._id } });
    }
    req.client = client;
    next();
  } catch (error) {
    next(error);
  }
};