import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserSession = sequelize.define('UserSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  jwtJti: {
    type: DataTypes.STRING(36),
    allowNull: false,
    unique: true,
    comment: 'Unique JWT ID (jti claim) for this session',
  },
  deviceType: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet', 'unknown'),
    defaultValue: 'unknown',
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Browser name and version parsed from User-Agent',
  },
  os: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Operating system parsed from User-Agent',
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Approximate geo-location derived from IP (e.g. "Mumbai, IN")',
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'True if the user has explicitly terminated this session',
  },
  lastActiveAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp of the most recent request using this session',
  },
}, {
  timestamps: true,
  tableName: 'user_sessions',
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['jwt_jti'], unique: true },
  ],
});

export default UserSession;
