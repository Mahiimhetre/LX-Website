import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: { // Storing hashed password
    type: DataTypes.STRING,
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'users',
  underscored: true,
  hooks: {
    beforeSave: (user) => {
      // Refresh expiry date only if password is new or has changed
      if (user.changed('password') && user.password) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 180);
        user.passwordExpiresAt = expiryDate;
      }
    }
  }
});

export default User;
