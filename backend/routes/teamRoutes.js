import express from 'express';
import { createTeam, getTeams, getTeamDetails, inviteUser, acceptInvite } from '../controllers/teamController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createTeam);
router.get('/', getTeams);
router.get('/:id', getTeamDetails);
router.post('/invite', inviteUser);
router.post('/accept', acceptInvite);

export default router;
