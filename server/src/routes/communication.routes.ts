import { Router } from 'express';
import { sendWhatsAppNotification, sendSMSNotification, sendEmailNotification } from '../controllers/communication.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/send-whatsapp', sendWhatsAppNotification);
router.post('/send-sms', sendSMSNotification);
router.post('/send-email', sendEmailNotification);

export default router;
