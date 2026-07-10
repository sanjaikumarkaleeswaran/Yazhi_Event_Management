import { Request, Response, NextFunction } from 'express';
import TeamMember from '../models/TeamMember';

export const getTeamMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const team = await TeamMember.find().sort({ order: 1 });

    res.status(200).json({
      status: 'success',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};
