import { Router } from 'express';
import { downloadBookingInvoice, downloadBookingContract, downloadPaymentReceipt } from '../controllers/document.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Stream PDF endpoints (Open for Client/Admin view with query token or header)
router.get('/invoice/:id', downloadBookingInvoice);
router.get('/contract/:id', downloadBookingContract);
router.get('/receipt/:id', downloadPaymentReceipt);

export default router;
