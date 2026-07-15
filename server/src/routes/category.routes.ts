import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';
import { protect, hasPermission } from '../middleware/authMiddleware';

const router = Router();

// Public route
router.get('/', getAllCategories);

// Admin routes (Protected)
router.post('/', protect, hasPermission('Blog', 'create'), createCategory);
router.patch('/:id', protect, hasPermission('Blog', 'edit'), updateCategory);
router.delete('/:id', protect, hasPermission('Blog', 'delete'), deleteCategory);

export default router;
