const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const ProductImage = sequelize.define('product_image', {
        itemId: {
            type: DataTypes.BIGINT(20),
        },
        imageUrl: {
            type: DataTypes.STRING(255),
        },
        position : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },
    })

    return ProductImage
}
