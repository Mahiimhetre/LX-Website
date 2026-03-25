import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: { // Who made the payment
    type: DataTypes.UUID,
    allowNull: false
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  planName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('paid', 'refunded', 'failed'),
    defaultValue: 'paid'
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  planStartedAt: { // When this specific 30-day block starts
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'payments',
  underscored: true
});

// No default export
