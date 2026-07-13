import { Router } from 'express';
import { createInquiry, createInquiryValidation, getAllInquiries, updateInquiry, deleteInquiry, convertToBooking, bulkUpdateInquiries, bulkDeleteInquiries } from '../controllers/inquiry.controller';
import { validate } from '../middleware/validationMiddleware';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public route to submit an inquiry
router.post('/', createInquiryValidation, validate, createInquiry);

// Protected Admin Routes for CRUD
router.use(protect);
router.get('/', getAllInquiries);
router.post('/bulk-update', bulkUpdateInquiries);
router.post('/bulk-delete', bulkDeleteInquiries);
router.post('/:id/convert', convertToBooking);
router.patch('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

export default router;
