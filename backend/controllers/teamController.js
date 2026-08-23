import { Team, TeamMember, TeamInvitation, User, Profile, Payment } from '../models/index.js';
import sequelize from '../config/database.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { sendTeamInviteEmail } from '../utils/emailService.jsx';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

/**
 * Create a new team workspace.
 * Requires valid Razorpay payment verification when upgrading to paid team tier.
 */
export const createTeam = async (req, res) => {
    try {
        const {
            name,
            memberCount,
            currency,
            totalPaid,
            paymentId,
            orderId,
            signature,
            discountCode
        } = req.body;
        const userId = req.user.id;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Team name is required' });
        }

        const teamName = name.trim();
        const initialMemberCount = memberCount ? Math.max(1, parseInt(memberCount, 10)) : 1;
        const hasPaymentData = Boolean(paymentId && orderId && signature);

        // Security check: If payment details are provided, verify them before elevating tier
        let actualAmountPaid = totalPaid ? parseFloat(totalPaid) : 0;
        let isPaidSubscription = false;

        if (hasPaymentData) {
            // 1. Verify Razorpay Signature
            const body = `${orderId}|${paymentId}`;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                .update(body)
                .digest('hex');

            if (expectedSignature !== signature) {
                return res.status(400).json({ success: false, message: 'Invalid payment signature' });
            }

            // 2. Prevent Replay Attacks
            const existingPayment = await Payment.findOne({ where: { razorpayPaymentId: paymentId } });
            if (existingPayment) {
                return res.status(400).json({ success: false, message: 'Payment has already been processed' });
            }

            // 3. Fetch Razorpay Order for accurate amount
            try {
                const razorpayOrder = await razorpay.orders.fetch(orderId);
                if (razorpayOrder) {
                    actualAmountPaid = razorpayOrder.amount / 100;
                }
            } catch (fetchErr) {
                console.warn('Could not fetch Razorpay order details:', fetchErr.message);
            }

            isPaidSubscription = true;
        } else if (process.env.NODE_ENV === 'production') {
            return res.status(400).json({
                success: false,
                message: 'Payment verification is required to create a paid team workspace.'
            });
        }

        // Execute creation within an atomic database transaction
        const result = await sequelize.transaction(async (t) => {
            const now = new Date();
            const planExpiresAt = isPaidSubscription
                ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
                : null;

            const team = await Team.create({
                name: teamName,
                ownerId: userId,
                memberCount: initialMemberCount,
                currency: currency === 'INR' ? 'INR' : 'USD',
                totalPaid: actualAmountPaid,
                isPaid: isPaidSubscription,
                planExpiresAt,
                planName: isPaidSubscription ? 'team' : 'free'
            }, { transaction: t });

            await TeamMember.create({
                teamId: team.id,
                userId: userId,
                role: 'admin'
            }, { transaction: t });

            if (isPaidSubscription) {
                await Payment.create({
                    userId,
                    teamId: team.id,
                    razorpayOrderId: orderId,
                    razorpayPaymentId: paymentId,
                    amount: actualAmountPaid,
                    planName: 'team',
                    planStartedAt: now,
                    status: 'paid'
                }, { transaction: t });

                const profile = await Profile.findOne({ where: { userId }, transaction: t });
                if (profile) {
                    profile.plan = 'team';
                    await profile.save({ transaction: t });
                }
            }

            return team;
        });

        res.status(201).json({ success: true, team: result });
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

        const teams = memberships
            .filter(m => m.team)
            .map(m => {
                const t = m.team.toJSON();
                t.owner_id = m.team.ownerId;
                t.member_count = m.team.memberCount;
                t.total_paid = m.team.totalPaid;
                return t;
            });

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

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const teamData = team.toJSON();
        teamData.owner_id = team.ownerId;
        teamData.member_count = team.memberCount;
        teamData.total_paid = team.totalPaid;

        res.json({ success: true, team: teamData });
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

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, message: 'Valid email address is required' });
        }

        const targetEmail = email.trim().toLowerCase();

        const membership = await TeamMember.findOne({ where: { teamId, userId: inviterId, role: 'admin' } });
        if (!membership) {
            return res.status(403).json({ success: false, message: 'Only admins can invite' });
        }

        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Enforce member quota limit
        const activeMembersCount = await TeamMember.count({ where: { teamId } });
        const pendingInvitesCount = await TeamInvitation.count({ where: { teamId, status: 'pending' } });
        if (activeMembersCount + pendingInvitesCount >= team.memberCount) {
            return res.status(400).json({
                success: false,
                message: `Team capacity reached (${team.memberCount} seats). Please upgrade your plan to add more members.`
            });
        }

        const user = await User.findOne({ where: { email: targetEmail } });
        if (user) {
            const existingMember = await TeamMember.findOne({ where: { teamId, userId: user.id } });
            if (existingMember) {
                return res.status(400).json({ success: false, message: 'User is already a member of this team' });
            }
        }

        let invitation = await TeamInvitation.findOne({ where: { teamId, email: targetEmail } });
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        if (invitation) {
             invitation.token = token;
             invitation.status = 'pending';
             invitation.role = role || 'member';
             invitation.expiresAt = expiresAt;
             await invitation.save();
        } else {
             invitation = await TeamInvitation.create({
                 teamId,
                 email: targetEmail,
                 role: role || 'member',
                 invitedBy: inviterId,
                 token,
                 expiresAt
             });
        }

        // Send invitation email
        try {
            const inviterProfile = await Profile.findOne({ where: { userId: inviterId } });
            const inviterName = inviterProfile?.name || req.user.email;
            const teamName = team?.name || 'Workspace Team';

            await sendTeamInviteEmail(targetEmail, inviterName, teamName, invitation.token);
        } catch (emailErr) {
            console.error('Failed to send team invite email:', emailErr);
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

        if (!token) {
            return res.status(400).json({ success: false, message: 'Invitation token is required' });
        }

        const result = await sequelize.transaction(async (t) => {
            const invitation = await TeamInvitation.findOne({
                where: { token, status: 'pending' },
                transaction: t
            });
            if (!invitation) {
                return { status: 400, data: { success: false, message: 'Invalid or expired invitation' } };
            }
            
            if (new Date() > new Date(invitation.expiresAt)) {
                invitation.status = 'expired';
                await invitation.save({ transaction: t });
                return { status: 400, data: { success: false, message: 'Invitation expired' } };
            }
            
            const user = await User.findByPk(userId, { transaction: t });
            if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
                return { status: 403, data: { success: false, message: 'Not authorized for this invite' } };
            }

            // Check if already a member
            const existingMember = await TeamMember.findOne({
                where: { teamId: invitation.teamId, userId },
                transaction: t
            });
            if (existingMember) {
                invitation.status = 'accepted';
                await invitation.save({ transaction: t });
                return { status: 400, data: { success: false, message: 'You are already a member of this team' } };
            }

            const team = await Team.findByPk(invitation.teamId, { transaction: t });
            if (!team) {
                return { status: 404, data: { success: false, message: 'Team not found' } };
            }

            // Enforce capacity constraint
            const currentMemberCount = await TeamMember.count({
                where: { teamId: team.id },
                transaction: t
            });
            if (currentMemberCount >= team.memberCount) {
                return {
                    status: 400,
                    data: {
                        success: false,
                        message: `Team capacity reached (${team.memberCount} members). Please ask the team admin to expand capacity.`
                    }
                };
            }

            await TeamMember.create({
                teamId: invitation.teamId,
                userId,
                role: invitation.role
            }, { transaction: t });

            invitation.status = 'accepted';
            await invitation.save({ transaction: t });

            const profile = await Profile.findOne({ where: { userId }, transaction: t });
            if (profile && profile.plan === 'free') {
                profile.plan = 'team';
                await profile.save({ transaction: t });
            }

            return { status: 200, data: { success: true, message: 'Joined team successfully' } };
        });

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error('acceptInvite error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Remove a team member
export const removeMember = async (req, res) => {
    try {
        const { id } = req.params; // memberId
        const userId = req.user.id;

        const member = await TeamMember.findByPk(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const team = await Team.findByPk(member.teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Only owner or admin of the team can remove members
        const requesterMembership = await TeamMember.findOne({ where: { teamId: team.id, userId } });
        if (!requesterMembership || (requesterMembership.role !== 'admin' && team.ownerId !== userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Cannot remove the owner of the team
        if (member.userId === team.ownerId) {
            return res.status(400).json({ success: false, message: 'Cannot remove the team owner' });
        }

        await member.destroy();

        // Update the removed user's plan if they have no other team memberships
        const otherMemberships = await TeamMember.findAll({ where: { userId: member.userId } });
        if (otherMemberships.length === 0) {
            const profile = await Profile.findOne({ where: { userId: member.userId } });
            if (profile && profile.plan === 'team') {
                profile.plan = 'free';
                await profile.save();
            }
        }

        res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        console.error('removeMember error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Cancel a pending invitation
export const cancelInvitation = async (req, res) => {
    try {
        const { id } = req.params; // invitationId
        const userId = req.user.id;

        const invitation = await TeamInvitation.findByPk(id);
        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invitation not found' });
        }

        const team = await Team.findByPk(invitation.teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Only owner or admin can cancel invitation
        const requesterMembership = await TeamMember.findOne({ where: { teamId: team.id, userId } });
        if (!requesterMembership || (requesterMembership.role !== 'admin' && team.ownerId !== userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await invitation.destroy();
        res.json({ success: true, message: 'Invitation cancelled successfully' });
    } catch (error) {
        console.error('cancelInvitation error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update a team member's role
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params; // memberId
        const { role } = req.body;
        const userId = req.user.id;

        if (!role || !['admin', 'member', 'viewer'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const member = await TeamMember.findByPk(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const team = await Team.findByPk(member.teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Only owner or admin can update role
        const requesterMembership = await TeamMember.findOne({ where: { teamId: team.id, userId } });
        if (!requesterMembership || (requesterMembership.role !== 'admin' && team.ownerId !== userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Cannot update owner's role
        if (member.userId === team.ownerId) {
            return res.status(400).json({ success: false, message: 'Cannot update the team owner\'s role' });
        }

        member.role = role;
        await member.save();

        res.json({ success: true, message: 'Member role updated successfully' });
    } catch (error) {
        console.error('updateRole error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get pending invitations for the user's email
export const getPendingInvitations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const invitations = await TeamInvitation.findAll({
            where: { email: user.email.toLowerCase(), status: 'pending' },
            include: [{ model: Team, as: 'team' }]
        });

        res.json({ success: true, invitations });
    } catch (error) {
        console.error('getPendingInvitations error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Accept pending invitations by token and auto-join team
export const acceptPendingInvitations = async (req, res) => {
    try {
        const { tokens } = req.body; // Array of invitation tokens
        const userId = req.user.id;

        if (!Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({ success: false, message: 'Tokens array is required' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const results = [];
        for (const token of tokens) {
            try {
                const joinResult = await sequelize.transaction(async (t) => {
                    const invitation = await TeamInvitation.findOne({
                        where: { token, status: 'pending', email: user.email.toLowerCase() },
                        transaction: t
                    });

                    if (!invitation) {
                        return { success: false, message: 'Invalid invitation' };
                    }

                    if (new Date() > new Date(invitation.expiresAt)) {
                        invitation.status = 'expired';
                        await invitation.save({ transaction: t });
                        return { success: false, message: 'Invitation expired' };
                    }

                    const existingMember = await TeamMember.findOne({
                        where: { teamId: invitation.teamId, userId },
                        transaction: t
                    });
                    if (existingMember) {
                        invitation.status = 'accepted';
                        await invitation.save({ transaction: t });
                        return { success: false, message: 'Already a member of this team' };
                    }

                    const team = await Team.findByPk(invitation.teamId, { transaction: t });
                    if (!team) {
                        return { success: false, message: 'Team not found' };
                    }

                    const currentCount = await TeamMember.count({
                        where: { teamId: team.id },
                        transaction: t
                    });
                    if (currentCount >= team.memberCount) {
                        return { success: false, message: 'Team member capacity reached' };
                    }

                    await TeamMember.create({
                        teamId: invitation.teamId,
                        userId,
                        role: invitation.role
                    }, { transaction: t });

                    invitation.status = 'accepted';
                    await invitation.save({ transaction: t });

                    const profile = await Profile.findOne({ where: { userId }, transaction: t });
                    if (profile && profile.plan === 'free') {
                        profile.plan = 'team';
                        await profile.save({ transaction: t });
                    }

                    return { success: true, message: 'Joined team successfully' };
                });

                results.push({ token, ...joinResult });
            } catch (error) {
                console.error(`Error accepting invitation ${token}:`, error);
                results.push({ token, success: false, message: 'Server error' });
            }
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error('acceptPendingInvitations error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
