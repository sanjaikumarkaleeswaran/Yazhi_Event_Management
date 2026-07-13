import { Router } from 'express';
import { createClient, getClients, getClientById, updateClient, deleteClient, bulkUpdateClients, bulkDeleteClients } from '../controllers/client.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', createClient);
router.get('/', getClients);
router.get('/:id', getClientById);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);

router.post('/bulk-update', bulkUpdateClients);
router.post('/bulk-delete', bulkDeleteClients);

export default router;
