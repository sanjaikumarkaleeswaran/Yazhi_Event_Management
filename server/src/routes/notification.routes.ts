import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount
} from '../controllers/notification.controller';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/:id', getNotificationById);
router.post('/', createNotification);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllRead);
router.delete('/clear', clearAllNotifications);
router.delete('/:id', deleteNotification);

export default router;
