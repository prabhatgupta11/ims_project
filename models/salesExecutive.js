const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const SalesExecutive = sequelize.define("sales_executive", {
    id: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    storeFk: {
      type: DataTypes.STRING(255),
    },
    name: {
      type: DataTypes.STRING(255),
    },

    contactNo: {
      type: DataTypes.STRING(255),
    },
    email: {
      type: DataTypes.STRING(255),
    },
    address: {
      type: DataTypes.TEXT,
    },
    isDeleted: {
      type: DataTypes.STRING,
      defaultValue: "0",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue : "Active"
    },
    created_by: {
      type: DataTypes.STRING(255),
    },
    created_on: {
      type: DataTypes.DATE,
    },
    edit_by: {
      type: DataTypes.STRING(255),
    },
    edit_on: {
      type: DataTypes.DATE,
    },
    approve_b: {
      type: DataTypes.BOOLEAN,
    },
    approved_by: {
      type: DataTypes.STRING(255),
    },
    displayorder: {
      type: DataTypes.INTEGER,
    },
    rowguid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
  });

  return SalesExecutive;
};
