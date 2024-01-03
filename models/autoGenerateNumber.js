const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    
    const AutoGenerateNumber = sequelize.define('auto_generate_no', {

        id : {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement : true
        },
        prefix : {
            type : DataTypes.STRING,
        },
        suffix : {
            type : DataTypes.STRING,
        },
        lastNo : {
            type : DataTypes.STRING,
        },
        docType : {
            type : DataTypes.STRING,
        },
        storePk : {
            type : DataTypes.BIGINT
        },
        totDigit : {
            type : DataTypes.INTEGER
        }
        
        
    },{
        timestamps: false, // Disable createdAt and updatedAt columns
       }
       )


    return AutoGenerateNumber
}