import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PromoCode = sequelize.define('PromoCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  discountType: {
    type: DataTypes.ENUM('percent', 'flat'),
    allowNull: false
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: true
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  maxUses: {
    type: DataTypes.INTEGER,
    defaultValue: null
  },
  currentUses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  specificUserId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  allowedPlans: {
    type: DataTypes.JSON, 
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'promo_codes',
  underscored: true
});

export default PromoCode;
