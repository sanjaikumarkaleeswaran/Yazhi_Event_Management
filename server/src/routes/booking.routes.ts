import { Router } from 'express';
import { getBookings, createBooking, updateBooking, deleteBooking } from '../controllers/booking.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Apply protect middleware to all routes (Admin Only)
router.use(protect);

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.route('/:id')
  .patch(updateBooking)
  .delete(deleteBooking);

export default router;
