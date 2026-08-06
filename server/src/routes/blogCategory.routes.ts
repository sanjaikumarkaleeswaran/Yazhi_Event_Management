import { Router } from 'express';
import { createCategory, updateCategory, getCategories, deleteCategory } from '../controllers/blogCategory.controller';
import { protect, hasPermission } from '../middleware/authMiddleware';

const router = Router();

// Public listing
router.get('/', getCategories);

// Admin routes
router.post('/', protect, hasPermission('Blog', 'create'), createCategory);
router.put('/:id', protect, hasPermission('Blog', 'edit'), updateCategory);
router.delete('/:id', protect, hasPermission('Blog', 'delete'), deleteCategory);

export default router;
