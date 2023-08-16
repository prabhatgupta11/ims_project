const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    
    const User = sequelize.define('users', {

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
        role : {
            type : DataTypes.STRING,
            default : "user"
        }
    })

    return User
}