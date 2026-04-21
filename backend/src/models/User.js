const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelizeConfig");

const User = sequelize.define(
  "tbl_user",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "New Employee", // Fallback for your existing DB rows
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: "barista", // Options: 'admin', 'manager', 'barista'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "Active", // Options: 'Active', 'Resigned'
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "tbl_user",
    timestamps: false,
  },
);

module.exports = User;
