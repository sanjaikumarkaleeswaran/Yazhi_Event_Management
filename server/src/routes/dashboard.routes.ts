import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.get('/', getDashboardData);

export default router;
