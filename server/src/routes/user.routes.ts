import { Router } from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  updateUserStatus, 
  updateUserRole, 
  updateUserPermissions,
  bulkUpdateStatus,
  bulkDeleteUsers
} from '../controllers/user.controller';
import { protect, hasPermission } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/', hasPermission('Users', 'view'), getUsers);
router.post('/', hasPermission('Users', 'create'), createUser);
router.post('/bulk-status', hasPermission('Users', 'edit'), bulkUpdateStatus);
router.post('/bulk-delete', hasPermission('Users', 'delete'), bulkDeleteUsers);

router.get('/:id', hasPermission('Users', 'view'), getUserById);
router.patch('/:id', hasPermission('Users', 'edit'), updateUser);
router.delete('/:id', hasPermission('Users', 'delete'), deleteUser);

router.patch('/:id/status', hasPermission('Users', 'edit'), updateUserStatus);
router.patch('/:id/role', hasPermission('Users', 'edit'), updateUserRole);
router.patch('/:id/permissions', hasPermission('Users', 'edit'), updateUserPermissions);

export default router;
