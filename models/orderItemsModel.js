const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const OrderItems = sequelize.define('orderItems', {
        // order_item_id: {
        //     type: DataTypes.INTEGER(11),
        //     allowNull: false,
        //     primaryKey: true,
        //     autoIncrement:true
        // },
        orderid: {
            type: DataTypes.INTEGER(11),
        },
        rowNo: {
            type: DataTypes.STRING(),
        },
        itemId : {
            type : DataTypes.STRING()
        },
        itemName : {
            type : DataTypes.STRING()
        },
        itemReferenceCode : {
            type : DataTypes.STRING()
        },
        salePrice : {
            type : DataTypes.STRING()
        },
        quantity : {
            type : DataTypes.STRING()
        },
        suppliedQty : {
            type : DataTypes.STRING()
        },
        itemAmount : {
            type : DataTypes.STRING()
        },
        iBarU : {
            type : DataTypes.STRING(255)
        },
        taxPercentage : {
            type : DataTypes.STRING()
        },
        itemTaxType : {
            type : DataTypes.STRING()
        },
        discountPercentage : {
            type : DataTypes.STRING()
        },
        itemRemarks : {
            type : DataTypes.STRING()
        },
        itemMarketPrice : {
            type : DataTypes.STRING()
        },
        freeQty : {
            type : DataTypes.STRING()
        },
        orderPK : {
            type : DataTypes.STRING()
        },
        aggregatorPaid : {
            type : DataTypes.STRING()
        },
        created_at : {
            type : DataTypes.DATE
        },
        updated_at : {
            type : DataTypes.DATE
        },
    })

    OrderItems.associate = (models) => {
        OrderItems.belongsTo(models.Order, { foreignKey: 'orderPK' }); // 'orderPK' should match the foreign key in the OrderItems model that references the Order model
      };

    return OrderItems
}





























