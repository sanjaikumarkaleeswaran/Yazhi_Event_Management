import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { type, priority, module, isRead, search } = req.query;

    const query: any = {
      $or: [
        { recipientId: req.user?._id },
        { recipientType: req.user?.role },
        { recipientType: 'All' }
      ]
    };

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (module) query.module = module;
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (search) {
      query.$or = [
        ...query.$or,
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Error fetching notifications' });
  }
};

// GET /api/notifications/:id
export const getNotificationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      $or: [
        { recipientId: req.user?._id },
        { recipientType: req.user?.role },
        { recipientType: 'All' }
      ]
    });

    if (!notification) {
      res.status(404).json({ status: 'error', message: 'Notification not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: { notification } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Error fetching notification' });
  }
};

// POST /api/notifications
export const createNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, type, priority, recipientType, recipientId, module, referenceId, referenceType, metadata } = req.body;

    const notification = new Notification({
      title,
      message,
      type,
      priority: priority || 'Medium',
      recipientType,
      recipientId,
      senderId: req.user?._id,
      module,
      referenceId,
      referenceType,
      metadata,
      isRead: false,
      scheduledAt: new Date()
    });

    await notification.save();

    res.status(201).json({ status: 'success', data: { notification } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Error creating notification' });
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { recipientId: req.user?._id },
          { recipientType: req.user?.role },
          { recipientType: 'All' }
        ]
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ status: 'error', message: 'Notification not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: { notification } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Error marking notification as read' });
  }
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = {
      isRead: false,
      $or: [
        { recipientId: req.user?._id },
        { recipientType: req.user?.role },
        { recipientType: 'All' }
      ]
    };

    await Notification.updateMany(query, {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Error marking all notifications as read' });
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { recipientId: req.user?._id },
        { recipientType: req.user?.role },
        { recipientType: 'All' }
      ]
    });

    if (!notification) {
      res.status(404).json({ status: 'error', message: 'Notification not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Notification deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Error deleting notification' });
  }
};

// DELETE /api/notifications/clear
export const clearAllNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = {
      $or: [
        { recipientId: req.user?._id },
        { recipientType: req.user?.role },
        { recipientType: 'All' }
      ]
    };

    await Notification.deleteMany(query);

    res.status(200).json({ status: 'success', message: 'All notifications cleared successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Error clearing notifications' });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = {
      isRead: false,
      $or: [
        { recipientId: req.user?._id },
        { recipientType: req.user?.role },
        { recipientType: 'All' }
      ]
    };

    const count = await Notification.countDocuments(query);

    res.status(200).json({ status: 'success', data: { count } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Error fetching unread count' });
  }
};
