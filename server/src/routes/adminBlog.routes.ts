import { Router } from 'express';
import {
  archivePost,
  createPost,
  duplicatePost,
  featurePost,
  getAdminPostById,
  getAdminPosts,
  getBlogReports,
  getBlogStats,
  publishPost,
  softDeletePost,
  unpublishPost,
  updatePost,
} from '../controllers/blog.controller';
import { hasPermission, protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.get('/', hasPermission('Blog', 'view'), getAdminPosts);
router.get('/stats', hasPermission('Blog', 'view'), getBlogStats);
router.get('/reports', hasPermission('Blog', 'export'), getBlogReports);
router.get('/:id', hasPermission('Blog', 'view'), getAdminPostById);
router.post('/', hasPermission('Blog', 'create'), createPost);
router.put('/:id', hasPermission('Blog', 'edit'), updatePost);
router.patch('/:id', hasPermission('Blog', 'edit'), updatePost);
router.delete('/:id', hasPermission('Blog', 'delete'), softDeletePost);
router.post('/:id/publish', hasPermission('Blog', 'publish'), publishPost);
router.post('/:id/unpublish', hasPermission('Blog', 'publish'), unpublishPost);
router.post('/:id/archive', hasPermission('Blog', 'edit'), archivePost);
router.post('/:id/duplicate', hasPermission('Blog', 'create'), duplicatePost);
router.post('/:id/feature', hasPermission('Blog', 'edit'), featurePost);

export default router;