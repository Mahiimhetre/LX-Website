import express from 'express';
import { 
    createTeam, 
    getTeams, 
    getTeamDetails, 
    inviteUser, 
    acceptInvite,
    removeMember,
    cancelInvitation,
    updateRole,
    getPendingInvitations,
    acceptPendingInvitations
} from '../controllers/teamController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createTeam);
router.get('/', getTeams);
router.get('/:id', getTeamDetails);
router.post('/invite', inviteUser);
router.post('/accept', acceptInvite);
router.get('/pending/invitations', getPendingInvitations);
router.post('/accept-multiple', acceptPendingInvitations);

// Member and Invitation Management (used by Team Dashboard)
router.delete('/members/:id', removeMember);
router.delete('/invitations/:id', cancelInvitation);
router.put('/members/:id', updateRole);

export default router;

