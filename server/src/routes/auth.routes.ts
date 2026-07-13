import { Router } from 'express';
import { 
  login, 
  logout, 
  logoutAll, 
  refresh, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  changePassword 
} from '../controllers/auth.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

export default router;
