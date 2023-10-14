const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const CustomerMaster = sequelize.define('Customer_Master', {
    id: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement : true
    },
    Code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ContactPersonName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ContactNo1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ContactNo2: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    Email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Address: {
      type:DataTypes.STRING(255), 
      allowNull: false,
    },
    Pincode: {
      type: DataTypes.STRING(255), 
      allowNull: false,
    },
    GSTNo: {
      type: DataTypes.STRING(255), 
      allowNull: false,
    },
    PAN: {
      type: DataTypes.STRING(255), 
      allowNull: false,
    },
    AadharNo: {
      type: DataTypes.STRING(255), 
      allowNull: false,
    },
    Status: {
      type: DataTypes.ENUM('Active', 'Inactive'), 
      defaultValue: 'Active',
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

  return CustomerMaster;
};