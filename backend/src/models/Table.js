const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizeConfig');

const Table = sequelize.define('tbl_table', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false },
  status: { type: DataTypes.STRING(20), defaultValue: 'Available' }, // Available or Occupied
  currentOrder: { type: DataTypes.STRING(50), allowNull: true }
}, {
  tableName: 'tbl_table',
  timestamps: false
});

module.exports = Table;