import express from 'express';
import { protect, hasPermission } from '../middleware/authMiddleware';
import {
  getPayments,
  createManualPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  refundPayment,
  handleRazorpayWebhook
} from '../controllers/payment.controller';

const router = express.Router();

// Webhook must be public for Razorpay to notify the application
router.post('/razorpay/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

router.use(protect); // Secure remaining payment routes

router.get('/', hasPermission('Payments', 'view'), getPayments);
router.post('/', hasPermission('Payments', 'create'), createManualPayment);
router.post('/razorpay/create-order', hasPermission('Payments', 'create'), createRazorpayOrder);
router.post('/razorpay/verify', hasPermission('Payments', 'edit'), verifyRazorpayPayment);
router.post('/:id/refund', hasPermission('Payments', 'edit'), refundPayment);

export default router;
