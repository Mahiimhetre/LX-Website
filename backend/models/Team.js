import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  memberCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  currency: {
    type: DataTypes.ENUM('USD', 'INR'),
    defaultValue: 'USD'
  },
  totalPaid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  planExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  planName: {
    type: DataTypes.STRING,
    defaultValue: 'free'
  }
}, {
  timestamps: true,
  tableName: 'teams',
  underscored: true
});

export const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'member', 'viewer'),
    defaultValue: 'member'
  }
}, {
  timestamps: true,
  tableName: 'team_members',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['team_id', 'user_id']
    }
  ]
});

export const TeamInvitation = sequelize.define('TeamInvitation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  role: {
    type: DataTypes.ENUM('admin', 'member', 'viewer'),
    defaultValue: 'member'
  },
  invitedBy: { // user id of inviter
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'expired'),
    defaultValue: 'pending'
  },
  token: {
    type: DataTypes.STRING,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'team_invitations',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['team_id', 'email']
    }
  ]
});
