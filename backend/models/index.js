import sequelize, { connectDB } from '../config/database.js';
import User from './User.js';
import Profile from './Profile.js';
import { Team, TeamMember, TeamInvitation } from './Team.js';
import PromoCode from './PromoCode.js';
import { Payment } from './Payment.js';

// User and Profile
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

// User and Payment
User.hasMany(Payment, { foreignKey: 'userId', as: 'userPayments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Team and Payment
Team.hasMany(Payment, { foreignKey: 'teamId', as: 'payments' });
Payment.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// User and Team (Owner)
User.hasMany(Team, { foreignKey: 'ownerId', as: 'ownedTeams' });
Team.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Team and TeamMember
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'members' });
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// User and TeamMember
User.hasMany(TeamMember, { foreignKey: 'userId', as: 'teamMemberships', onDelete: 'CASCADE' });
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

// Team and TeamInvitation
Team.hasMany(TeamInvitation, { foreignKey: 'teamId', as: 'invitations' });
TeamInvitation.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// User and TeamInvitation (Invited By)
User.hasMany(TeamInvitation, { foreignKey: 'invitedBy', as: 'sentInvitations' });
TeamInvitation.belongsTo(User, { foreignKey: 'invitedBy', as: 'inviter' });

// User and PromoCode (Specific User)
User.hasMany(PromoCode, { foreignKey: 'specificUserId', as: 'personalPromos' });
PromoCode.belongsTo(User, { foreignKey: 'specificUserId', as: 'user' });

export {
    sequelize,
    connectDB,
    User,
    Profile,
    Team,
    TeamMember,
    TeamInvitation,
    PromoCode,
    Payment
};
