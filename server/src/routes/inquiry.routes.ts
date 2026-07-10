import { Router } from 'express';
import { createInquiry, createInquiryValidation } from '../controllers/inquiry.controller';
import { validate } from '../middleware/validationMiddleware';

const router = Router();

router.post('/', createInquiryValidation, validate, createInquiry);

export default router;
