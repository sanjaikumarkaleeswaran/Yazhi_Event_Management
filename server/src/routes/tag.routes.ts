import { Router } from 'express';
import {
  createTag,
  getAllTags,
  updateTag,
  deleteTag
} from '../controllers/tag.controller';
import { protect, hasPermission } from '../middleware/authMiddleware';

const router = Router();

// Public route
router.get('/', getAllTags);

// Admin routes (Protected)
router.post('/', protect, hasPermission('Blog', 'create'), createTag);
router.patch('/:id', protect, hasPermission('Blog', 'edit'), updateTag);
router.delete('/:id', protect, hasPermission('Blog', 'delete'), deleteTag);

export default router;
