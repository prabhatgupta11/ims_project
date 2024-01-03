const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    
    const StockInOut = sequelize.define('stock_ledger', {
        id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement : true
        },
        productPriceFk : {
            type : DataTypes.STRING(20),
        },
        itemId : {
            type : DataTypes.STRING(50),
        },
        outletId : {
            type : DataTypes.STRING(50),
        },
        type : {
            type : DataTypes.STRING,
        },
        productHsnCode: {
            type: DataTypes.STRING,
        },
        batchNo: {
            type: DataTypes.STRING,
        },
        expDate: {
            type: DataTypes.STRING,
        },
        qty : {
            type : DataTypes.STRING,
        },
        purchasePrice : {
            type : DataTypes.STRING,
        },
        salePriceInclTax: {
            type: DataTypes.STRING,
        },
        salePriceExclTax: {
            type: DataTypes.STRING,
        },
        remarks : {
            type : DataTypes.STRING,
        },
        created_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        created_by: {
            type: DataTypes.STRING,
        }
    },
       {
        timestamps: false, // Disable createdAt and updatedAt columns
       }
    )

    return StockInOut
}

