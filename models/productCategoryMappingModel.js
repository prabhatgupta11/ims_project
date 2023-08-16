const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    
    const ProductCategoryMapping = sequelize.define('product_category_mapping', {
        id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement : true
        },
        outletId : {
            type : DataTypes.BIGINT(20),
            allowNull : false,
        },
        itemId : {
            type : DataTypes.BIGINT(20),
            allowNull : false,
        },
        cat1 : {
            type : DataTypes.STRING(255),
        },
        cat2 : {
            type : DataTypes.STRING(255),
        },
    
    })

    return ProductCategoryMapping
}