const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    
    const User = sequelize.define('users', {
        id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement : true
        },
        firstName : {
            type: DataTypes.STRING(255),
            allowNull : false,
        },
        lastName : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        email : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        password : {
            type : DataTypes.STRING(255),
            allowNull : false,
        },
        mobileNumber : {
            type : DataTypes.STRING(20),
            allowNull : false
        },
        managerFk : {
            type : DataTypes.BIGINT(20),
            defaultValue : -1
        },
        role : {
            type : DataTypes.STRING,
            defaultValue : 'user'
        },
        resetToken : {
            type : DataTypes.STRING,
        },
        isDeleted : {
            type : DataTypes.STRING,
            defaultValue : '0' 
        }
    })

    return User
}