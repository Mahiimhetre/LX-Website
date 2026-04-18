import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Locator = sequelize.define('Locator', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  selector: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('xpath', 'css', 'id', 'name', 'tag', 'class'),
    defaultValue: 'xpath'
  },
  elementTag: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pageUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'locators',
  underscored: true
});

export default Locator;
