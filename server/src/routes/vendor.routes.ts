import { Router } from 'express';
import { createVendor, getVendors, getVendorById, updateVendor, deleteVendor, bulkUpdateVendors, bulkDeleteVendors } from '../controllers/vendor.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', createVendor);
router.get('/', getVendors);
router.get('/:id', getVendorById);
router.patch('/:id', updateVendor);
router.delete('/:id', deleteVendor);

router.post('/bulk-update', bulkUpdateVendors);
router.post('/bulk-delete', bulkDeleteVendors);

export default router;
