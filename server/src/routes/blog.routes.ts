import { Router } from 'express';
import {
  createPost,
  updatePost,
  getAllPosts,
  getPostBySlug,
  duplicatePost,
  likePost,
  sharePost,
  softDeletePost,
  restorePost,
  permanentDeletePost,
  getAdminPosts,
  getBlogStats,
  getBlogReports
} from '../controllers/blog.controller';
import { protect, hasPermission } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getAllPosts);
router.get('/slug/:slug', getPostBySlug);
router.post('/:id/like', likePost);
router.post('/:id/share', sharePost);

// Admin CMS routes (Protected)
router.get('/admin', protect, hasPermission('Blog', 'view'), getAdminPosts);
router.get('/admin/stats', protect, hasPermission('Blog', 'view'), getBlogStats);
router.get('/admin/reports', protect, hasPermission('Blog', 'view'), getBlogReports);

router.post('/', protect, hasPermission('Blog', 'create'), createPost);
router.put('/:id', protect, hasPermission('Blog', 'edit'), updatePost);
router.post('/:id/duplicate', protect, hasPermission('Blog', 'create'), duplicatePost);
router.post('/:id/restore', protect, hasPermission('Blog', 'edit'), restorePost);
router.delete('/:id', protect, hasPermission('Blog', 'delete'), softDeletePost);
router.delete('/:id/permanent', protect, hasPermission('Blog', 'delete'), permanentDeletePost);

export default router;
