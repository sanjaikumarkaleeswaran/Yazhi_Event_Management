import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getPayments,
  createManualPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  refundPayment
} from '../controllers/payment.controller';

const router = express.Router();

router.use(protect); // Secure all payment routes

router.get('/', getPayments);
router.post('/', createManualPayment);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.post('/:id/refund', refundPayment);

export default router;
