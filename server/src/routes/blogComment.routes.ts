import { Router } from 'express';
import { createComment, getComments, updateCommentStatus, deleteComment } from '../controllers/blogComment.controller';
import { protect, hasPermission } from '../middleware/authMiddleware';

const router = Router();

// Public: add comment
router.post('/', createComment);

// Admin: moderate comments
router.get('/', protect, hasPermission('Blog', 'view'), getComments);
router.patch('/:id', protect, hasPermission('Blog', 'edit'), updateCommentStatus);
router.delete('/:id', protect, hasPermission('Blog', 'delete'), deleteComment);

export default router;
