import { Request, Response, NextFunction } from 'express';
import Package from '../models/Package';

export const getPackages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventType } = req.query;
    const filter = typeof eventType === 'string' ? { eventType } : {};

    const packages = await Package.find(filter).sort({ startingPrice: 1 });

    res.status(200).json({
      status: 'success',
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};
