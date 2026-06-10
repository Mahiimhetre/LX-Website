import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SecurityAuditLog = sequelize.define('SecurityAuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Null for anonymous events like failed login with unknown email',
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Machine-readable event key (e.g. LOGIN_SUCCESS, TOKEN_CREATED, PASSWORD_CHANGED)',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Human-readable details about this event',
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Raw User-Agent header from the request',
  },
}, {
  timestamps: true,
  updatedAt: false,
  tableName: 'security_audit_logs',
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['event_type'] },
    { fields: ['created_at'] },
  ],
});

export default SecurityAuditLog;
