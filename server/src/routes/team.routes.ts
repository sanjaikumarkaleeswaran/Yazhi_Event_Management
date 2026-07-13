import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getTeam,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  updateEmploymentStatus,
  updateAvailabilityStatus,
  uploadTeamDocument,
  deleteTeamDocument,
  getTeamAvailabilityStats,
  getTeamWorkloadStats
} from '../controllers/team.controller';

const router = Router();

router.use(protect); // Secure all team routes

router.get('/', getTeam);
router.get('/availability', getTeamAvailabilityStats);
router.get('/workload', getTeamWorkloadStats);

router.post('/', createTeamMember);
router.get('/:id', getTeamMemberById);
router.patch('/:id', updateTeamMember);
router.delete('/:id', deleteTeamMember);

router.patch('/:id/status', updateEmploymentStatus);
router.patch('/:id/availability', updateAvailabilityStatus);
router.post('/:id/document', uploadTeamDocument);
router.delete('/:id/document', deleteTeamDocument);

export default router;
