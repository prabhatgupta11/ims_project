const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    
    const Manufacturer = sequelize.define('manufacturer_master', {
        manufacturerId: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement : true
        },
        shortDescription : {
            type : DataTypes.TEXT,
          
        },
        longDescription : {
            type : DataTypes.TEXT,
            
        },
    
    })

    return Manufacturer
}