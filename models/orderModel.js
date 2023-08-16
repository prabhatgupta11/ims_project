const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('orders', {
        // id: {
        //     type: DataTypes.BIGINT(20),
        //     primaryKey: true,
        //     autoIncrement:true
        // },
        orderPK: {
            type: DataTypes.STRING(),
        },
        onlineReferenceNo: {
            type: DataTypes.STRING(),
        },
        onlineChildReferenceNo : {
            type : DataTypes.STRING(),
        },
        status : {
            type : DataTypes.STRING()
        },
        orderRemarks : {
            type : DataTypes.STRING()
        },
        Channel : {
            type : DataTypes.STRING()
        },
        totalQuantity : {
            type : DataTypes.STRING()
        },
        totalFreeQty : {
            type : DataTypes.STRING()
        },
        totalAmount : {
            type : DataTypes.STRING()
        },
        paymentMode : {
            type : DataTypes.STRING()
        },
        paymentMethod: {
            type: DataTypes.STRING,
            // defaultValue : 'offline'
        },
        totalTaxAmount : {
            type : DataTypes.STRING()
        },
        totalDiscountAmount : {
            type : DataTypes.STRING()
        },
        orderDiscPerc : {
            type : DataTypes.STRING()
        },
        orderDiscAmt : {
            type : DataTypes.STRING()
        },
        courierPartner : {
            type : DataTypes.STRING()
        },
        shippingId : {
            type : DataTypes.STRING()
        },
        shippingName : {
            type : DataTypes.STRING()
        },
        shippingAddress1: {
            type: DataTypes.BLOB, // Use TEXT or BLOB for large columns
        },
        shippingAddress: {
            type: DataTypes.TEXT, // Use TEXT or BLOB for large columns
        },
        shippingPlace : {
            type : DataTypes.STRING()
        },
        shippingState : {
            type : DataTypes.STRING()
        },
        shippingStateCode : {
            type : DataTypes.STRING()
        },
        shippingCountry : {
            type : DataTypes.STRING()
        },
        shippingPinCode : {
            type : DataTypes.STRING()
        },
        shippingPhone : {
            type : DataTypes.STRING()
        },
        shippingMobile : {
            type : DataTypes.STRING()
        },
        shippingEmail : {
            type : DataTypes.STRING()
        },
        shippingCharge : {
            type : DataTypes.STRING()
        },
        packingCharge : {
            type : DataTypes.STRING()
        },
        shippingMethod : {
            type : DataTypes.STRING()
        
        },
        ShipmentPointsUsed : {
            type : DataTypes.STRING()
        },
        shipmentItems : {
            type : DataTypes.STRING()
        },
        shipmentABN : {
            type : DataTypes.STRING()
        },
        shipmentWeight : {
            type : DataTypes.STRING()
        },
        latitude : {
            type : DataTypes.STRING()
        },
        longitude : {
            type : DataTypes.STRING()
        },
        customeLatitude : {
            type : DataTypes.STRING()
        },
        customeLongitude : {
            type : DataTypes.STRING()
        },
        discountCoupon: {
            type : DataTypes.STRING()
        },
        deliveryDate : {
            type : DataTypes.STRING()
        },
        locationId : {
            type : DataTypes.STRING()
        },
        userId : {
            type : DataTypes.STRING()
        },
        appUserName : {
            type : DataTypes.STRING()
        },
        customerCode : {
            type : DataTypes.STRING()
        },
        customerId : {
            type : DataTypes.STRING()
        },
        customerName : {
            type : DataTypes.STRING()
        },
        customerType : {
            type : DataTypes.STRING()
        },
        customerAddressLine1: {
            type: DataTypes.TEXT, // Use TEXT or BLOB for large columns
        },
        customerAddressLine: {
            type: DataTypes.TEXT, // Use TEXT or BLOB for large columns
        },
        customerAddressLine3 : {
            type : DataTypes.TEXT
        },
        customerArea : {
            type : DataTypes.STRING()
        },
        customerCity : {
            type : DataTypes.STRING()
        },
        customerState : {
            type : DataTypes.STRING()
        },
        customerCountry : {
            type : DataTypes.STRING()
        },
        customerPinCode : {
            type : DataTypes.STRING()
        },
        customerPhone : {
            type : DataTypes.STRING()
        },
        customerMobile : {
            type : DataTypes.STRING()
        },
        customerEmail : {
            type : DataTypes.STRING()
        },
        ordTimestamp : {
            type : DataTypes.STRING()
        },
        outletId : {
            type : DataTypes.STRING()
        },
        isOfflineOrder : {
            type : DataTypes.STRING()
        },
        invoiceNo : {
            type : DataTypes.STRING()
        },
        deliveryBoy : {
            type : DataTypes.STRING()
        },
        deilveryBoyMobileNo : {
            type : DataTypes.STRING()
        },
        otherChargesTaxAmount : {
            type : DataTypes.STRING()
        },
        otherChargesTaxPercentage : {
            type : DataTypes.STRING()
        },
        otherChargesTaxInclusive : {
            type : DataTypes.STRING()
        },
        serviceTaxAmount : {
            type : DataTypes.STRING()
        },
    })

    
    Order.associate = (models) => {
        Order.hasMany(models.OrderItems, { foreignKey: 'shippingMobile' }); // 'orderPK' should match the primary key in the OrderItems model
      };
      
    return Order
}































