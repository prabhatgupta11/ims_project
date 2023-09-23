const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    
    const NewStore = sequelize.define('new_store_master', {
        outletId: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement : true
        },
        code : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        storeName : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        businessType : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        address1 : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        address2 : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        state : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        pincode : {
            type : DataTypes.NUMBER(6),
            allowNull : false,
        },
        contactPersonName : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        contactNo1 : {
            type : DataTypes.NUMBER(11),
            allowNull : false,
        },
        contactNo2 : {
            type : DataTypes.NUMBER(11),
            allowNull : false,
        },
        GSTNo : {
            type : DataTypes.STRING(15),
            allowNull : false,
        },
        panNo : {
            type : DataTypes.STRING(10),
            allowNull : false,
        },
        taxState : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        status : {
            type : DataTypes.STRING(255),
            defaultValue : 'active',
        },
        displayOrder : {
            type : DataTypes.STRING(255),
            allowNull : false,
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
        rowguid : {
            type : DataTypes.UUID,
            defaultValue : DataTypes.UUIDV4
        }
    
    })

    return NewStore
}