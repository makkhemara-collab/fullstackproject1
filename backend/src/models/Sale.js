const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizeConfig');

const Sale = sequelize.define('tbl_sale', {
  sale_id: {
    type: DataTypes.STRING(25),
    primaryKey: true,
    allowNull: false
  },
  invoice_id: {
    type: DataTypes.STRING(25),
    allowNull: true
  },
  sale_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  sub_total: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  tax: {
    type: DataTypes.DECIMAL(10),
    allowNull: false
  },
  discount: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: 0.00
  },
  pay_method: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  order_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'Dine-in'
  },
  table_id: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  is_rush: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending' // Sent to Kitchen automatically
  },
  create_by: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_on: {
    type: DataTypes.DATE,
    allowNull: true
  },
  changed_by: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  changed_on: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'tbl_sale',
  timestamps: false
});

module.exports = Sale;
