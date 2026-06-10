import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PersonalAccessToken = sequelize.define('PersonalAccessToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'User-assigned label for this token (e.g. "Chrome Extension")',
  },
  tokenHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    comment: 'SHA-256 hex digest of the plaintext lx_pat_ token',
  },
  scopes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ['locators:read', 'locators:write'],
    comment: 'Array of permission scopes granted to this token',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Null means the token never expires',
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastUsedIp: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Supports both IPv4 and IPv6 addresses',
  },
}, {
  timestamps: true,
  tableName: 'personal_access_tokens',
  underscored: true,
});

export default PersonalAccessToken;
