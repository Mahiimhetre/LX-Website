import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  plan: {
    type: DataTypes.STRING,
    defaultValue: 'free'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'profiles',
  underscored: true
});

export default Profile;
