import { Router } from 'express';
import { getBookings, getMyBookings, createBooking, updateBooking, deleteBooking, bulkUpdateBookings, bulkDeleteBookings } from '../controllers/booking.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Apply protect middleware to all routes
router.use(protect);

router.get('/my-bookings', getMyBookings);

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.post('/bulk-update', bulkUpdateBookings);
router.post('/bulk-delete', bulkDeleteBookings);

router.route('/:id')
  .patch(updateBooking)
  .delete(deleteBooking);

export default router;
