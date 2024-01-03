const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    
    const Store = sequelize.define('store_master', {
        outletId: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement : true
        },
        code : {
            type : DataTypes.STRING(255),
        },
        storeName : {
            type : DataTypes.STRING(255),
        },
        businessType : {
            type : DataTypes.STRING(255),
        },
        address1 : {
            type : DataTypes.STRING(255),
        },
        address2 : {
            type : DataTypes.STRING(255),
        },
        state : {
            type : DataTypes.STRING(255),
        },
        pincode : {
            type : DataTypes.STRING(20),
        },
        contactPersonName : {
            type : DataTypes.STRING(255),
        },
        contactNo1 : {
            type : DataTypes.STRING(20),
        },
        contactNo2 : {
            type : DataTypes.STRING(20),
        },
        GSTNo : {
            type : DataTypes.STRING(255),
        },
        panNo : {
            type : DataTypes.STRING(255),
        },
        taxState : {
            type : DataTypes.STRING(255),
        },
        status : {
            type : DataTypes.STRING(255),
            defaultValue : 'Active',
        },
        isDeleted: {
            type: DataTypes.STRING, 
            defaultValue: '0',
          },
        displayOrder : {
            type : DataTypes.STRING,
        },
        edit_by : {
            type : DataTypes.STRING(255),
        },
        edit_on : {
            type : DataTypes.DATE,
        },
        approve_b : {
            type : DataTypes.STRING,
            defaultValue:'pending'
        },
        approve_by : {
            type : DataTypes.STRING,
        },
        rowguid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    
    })

    return Store
}