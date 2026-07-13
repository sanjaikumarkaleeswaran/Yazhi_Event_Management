import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getOverview,
  getBookingAnalytics,
  getInquiryAnalytics,
  getClientAnalytics,
  getVendorAnalytics
} from '../controllers/analytics.controller';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/overview', getOverview);
router.get('/bookings', getBookingAnalytics);
router.get('/inquiries', getInquiryAnalytics);
router.get('/clients', getClientAnalytics);
router.get('/vendors', getVendorAnalytics);

export default router;
