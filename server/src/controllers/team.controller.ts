import { Request, Response, NextFunction } from 'express';
import TeamMember from '../models/TeamMember';
import Booking from '../models/Booking';

// GET /api/team
export const getTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, department, availabilityStatus, employmentStatus, sort } = req.query;
    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex }
      ];
    }
    if (department) query.department = department;
    if (availabilityStatus) query.availabilityStatus = availabilityStatus;
    if (employmentStatus) query.employmentStatus = employmentStatus;

    let sortOption: any = { createdAt: -1 };
    if (sort) {
      const [field, order] = (sort as string).split(':');
      sortOption = { [field]: order === 'desc' ? -1 : 1 };
    }

    const total = await TeamMember.countDocuments(query);
    const team = await TeamMember.find(query)
      .populate('assignedBookings', 'bookingNumber eventType eventDate status')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: team,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/team/:id
export const getTeamMemberById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await TeamMember.findById(req.params.id)
      .populate('assignedBookings', 'bookingNumber eventType eventDate status');

    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: member });
  } catch (error) {
    next(error);
  }
};

// POST /api/team
export const createTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = { ...req.body };
    if (!data.employeeId) {
      data.employeeId = `EMP-${Date.now().toString().slice(-5)}`;
    }
    data.timeline = [{ action: 'Employee Created', description: 'Employee profile registered', date: new Date() }];

    const member = await TeamMember.create(data);
    res.status(201).json({ status: 'success', data: member });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/team/:id
export const updateTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    // Merge changes
    Object.assign(member, req.body);
    member.timeline.push({ action: 'Employee Updated', description: 'General details updated', date: new Date() });
    
    await member.save();
    res.status(200).json({ status: 'success', data: member });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/team/:id
export const deleteTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }
    res.status(200).json({ status: 'success', message: 'Team member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/team/:id/status
export const updateEmploymentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employmentStatus } = req.body;
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    member.employmentStatus = employmentStatus;
    member.timeline.push({
      action: 'Status Changed',
      description: `Employment status updated to ${employmentStatus}`,
      date: new Date()
    });

    await member.save();
    res.status(200).json({ status: 'success', data: member });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/team/:id/availability
export const updateAvailabilityStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { availabilityStatus } = req.body;
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    member.availabilityStatus = availabilityStatus;
    member.timeline.push({
      action: 'Status Changed',
      description: `Availability status updated to ${availabilityStatus}`,
      date: new Date()
    });

    await member.save();
    res.status(200).json({ status: 'success', data: member });
  } catch (error) {
    next(error);
  }
};

// POST /api/team/:id/document
export const uploadTeamDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, url } = req.body;
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    member.documents.push({ name, url, uploadedAt: new Date() });
    member.timeline.push({
      action: 'Document Uploaded',
      description: `Document ${name} uploaded`,
      date: new Date()
    });

    await member.save();
    res.status(200).json({ status: 'success', data: member });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/team/:id/document
export const deleteTeamDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { documentId } = req.body;
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    member.documents = member.documents.filter(doc => (doc as any)._id.toString() !== documentId);
    member.timeline.push({
      action: 'Document Removed',
      description: 'A document was removed from profile',
      date: new Date()
    });

    await member.save();
    res.status(200).json({ status: 'success', data: member });
  } catch (error) {
    next(error);
  }
};

// GET /api/team/availability
export const getTeamAvailabilityStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await TeamMember.aggregate([
      {
        $group: {
          _id: '$availabilityStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json({ status: 'success', data: stats });
  } catch (error) {
    next(error);
  }
};

// GET /api/team/workload
export const getTeamWorkloadStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workload = await TeamMember.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          department: 1,
          designation: 1,
          availabilityStatus: 1,
          eventCount: { $size: '$assignedBookings' }
        }
      },
      { $sort: { eventCount: -1 } }
    ]);
    res.status(200).json({ status: 'success', data: workload });
  } catch (error) {
    next(error);
  }
};
