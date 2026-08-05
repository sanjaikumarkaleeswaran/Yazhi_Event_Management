import { Router } from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import {
  getSettings,
  updateSettings,
  patchSettings,
  testEmail,
  createBackup,
  restoreSettings,
} from '../controllers/settings.controller';

const router = Router();

router.get('/', protect, getSettings);
router.put('/', protect, restrictTo('Admin', 'Super Admin'), updateSettings);
router.patch('/', protect, restrictTo('Admin', 'Super Admin'), patchSettings);
router.post('/test-email', protect, restrictTo('Admin', 'Super Admin'), testEmail);
router.post('/backup', protect, restrictTo('Admin', 'Super Admin'), createBackup);
router.post('/restore', protect, restrictTo('Admin', 'Super Admin'), restoreSettings);

export default router;
