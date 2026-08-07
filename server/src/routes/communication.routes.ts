import { Router } from 'express';
import { bulkSend, deleteCommunication, getCommunication, getCommunications, resend, sendEmail, sendSMS, sendWhatsApp, sendWhatsAppNotification, sendSMSNotification, sendEmailNotification } from '../controllers/communication.controller';
import { hasPermission, protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', hasPermission('Communications', 'view'), getCommunications);
router.get('/:id', hasPermission('Communications', 'view'), getCommunication);
router.post('/email', hasPermission('Communications', 'create'), sendEmail);
router.post('/sms', hasPermission('Communications', 'create'), sendSMS);
router.post('/whatsapp', hasPermission('Communications', 'create'), sendWhatsApp);
router.post('/bulk', hasPermission('Communications', 'create'), bulkSend);
router.post('/:id/resend', hasPermission('Communications', 'create'), resend);
router.delete('/:id', hasPermission('Communications', 'delete'), deleteCommunication);

router.post('/send-whatsapp', sendWhatsAppNotification);
router.post('/send-sms', sendSMSNotification);
router.post('/send-email', sendEmailNotification);

export default router;
