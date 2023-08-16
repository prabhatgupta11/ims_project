const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    
    const ProductRaise = sequelize.define('product_raise', {
    
        id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement : true
        },
        itemId : {
            type : DataTypes.STRING(255),
        },
        outletId : {
            type : DataTypes.STRING(255),
        },
        mrp : {
            type : DataTypes.FLOAT(10,2),
            allowNull : false,
        },
        price : {
            type : DataTypes.FLOAT(10,2),
            allowNull : false,
        },
    
    })

    return ProductRaise
}