const { DataTypes } = require("sequelize");
const { sequelize, user } = require(".");

module.exports = (sequelize, DataTypes) => {
    const SaleQuotationItem = sequelize.define('sale_quotationItem', {
        // id: {
        //     type: DataTypes.BIGINT(20),
        //     allowNull: false,
        //     primaryKey: true,
        //     autoIncrement: true
        // },
        // orderFk: {
        //     type: DataTypes.STRING,
        // },
        id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        orderFk: {
            type: DataTypes.INTEGER(11),  
        },
        outletId: {
            type: DataTypes.STRING,
        },
        itemId: {
            type: DataTypes.STRING,
        },
        qty: {
            type: DataTypes.STRING,
        },
        purchasePrice: {
            type: DataTypes.STRING,
        },
        mrp: {
            type: DataTypes.STRING,
        },
        rate: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
        totalAmount: {
            type: DataTypes.STRING,
        },
        created_by: {
            type: DataTypes.DATE,
        },
        created_on: {
            type: DataTypes.DATE,
            defaultValue:DataTypes.NOW
        },
        rowguid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    },
       {
        timestamps: false, // Disable createdAt and updatedAt columns
       });

    return SaleQuotationItem;
};
