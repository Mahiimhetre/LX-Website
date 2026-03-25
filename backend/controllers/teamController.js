import { Team, TeamMember, TeamInvitation, User, Profile } from '../models/index.js';
import crypto from 'crypto';

// Create a new team
export const createTeam = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        const team = await Team.create({
            name,
            ownerId: userId,
            memberCount: 1
        });

        await TeamMember.create({
            teamId: team.id,
            userId: userId,
            role: 'admin'
        });

        const profile = await Profile.findOne({ where: { userId } });
        if (profile) {
            profile.plan = 'team';
            await profile.save();
        }

        res.status(201).json({ success: true, team });
    } catch (error) {
        console.error('createTeam error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get user's teams
export const getTeams = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const memberships = await TeamMember.findAll({
            where: { userId },
            include: [{ model: Team, as: 'team' }]
        });

        const teams = memberships.map(m => m.team);

        res.json({ success: true, teams });
    } catch (error) {
        console.error('getTeams error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get single team details
export const getTeamDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const membership = await TeamMember.findOne({ where: { teamId: id, userId } });
        if (!membership) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const team = await Team.findByPk(id, {
            include: [
                { 
                    model: TeamMember, 
                    as: 'members', 
                    include: [{ model: User, as: 'user', attributes: ['id', 'email'], include: [{ model: Profile, as: 'profile', attributes: ['name', 'avatarUrl', 'plan'] }] }] 
                },
                {
                    model: TeamInvitation,
                    as: 'invitations'
                }
            ]
        });

        res.json({ success: true, team });
    } catch (error) {
        console.error('getTeamDetails error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Invite a user
export const inviteUser = async (req, res) => {
    try {
        const { teamId, email, role } = req.body;
        const inviterId = req.user.id;

        const membership = await TeamMember.findOne({ where: { teamId, userId: inviterId, role: 'admin' } });
        if (!membership) {
            return res.status(403).json({ success: false, message: 'Only admins can invite' });
        }

        const user = await User.findOne({ where: { email } });
        if (user) {
            const existingMember = await TeamMember.findOne({ where: { teamId, userId: user.id } });
            if (existingMember) {
                return res.status(400).json({ success: false, message: 'User already in team' });
            }
        }

        let invitation = await TeamInvitation.findOne({ where: { teamId, email } });
        
        if (invitation) {
             invitation.token = crypto.randomBytes(32).toString('hex');
             invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
             await invitation.save();
        } else {
             invitation = await TeamInvitation.create({
                 teamId,
                 email,
                 role: role || 'member',
                 invitedBy: inviterId,
                 token: crypto.randomBytes(32).toString('hex'),
                 expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
             });
        }

        res.json({ success: true, message: 'Invitation sent', invitation });
    } catch (error) {
        console.error('inviteUser error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Accept invite
export const acceptInvite = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;

        const invitation = await TeamInvitation.findOne({ where: { token, status: 'pending' } });
        if (!invitation) return res.status(404).json({ success: false, message: 'Invalid or expired invitation' });
        
        if (new Date() > new Date(invitation.expiresAt)) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ success: false, message: 'Invitation expired' });
        }
        
        const user = await User.findByPk(userId);
        if (user.email !== invitation.email) {
            return res.status(403).json({ success: false, message: 'Not authorized for this invite' });
        }

        await TeamMember.create({
            teamId: invitation.teamId,
            userId,
            role: invitation.role
        });

        invitation.status = 'accepted';
        await invitation.save();

        const team = await Team.findByPk(invitation.teamId);
        team.memberCount += 1;
        await team.save();

        const profile = await Profile.findOne({ where: { userId } });
        if (profile) {
            profile.plan = 'team';
            await profile.save();
        }

        res.json({ success: true, message: 'Joined team successfully' });
    } catch (error) {
        console.error('acceptInvite error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
