const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('orders', {
        orderId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement : true
        },
        purchaseOrderFk : {
            type : DataTypes.STRING(10),
            defaultValue : '-1'
        },
        isReturn : {
            type : DataTypes.STRING,
            defaultValue : "0"
        },
        orderType : {
            type : DataTypes.STRING,
            defaultValue : 'order'
        },
        stockType : {
            type : DataTypes.STRING(10)
        },
        outletId : {
            type : DataTypes.STRING
        },
        orderDate: {
            type: DataTypes.STRING,
        },
        referenceNumber : {
            type : DataTypes.STRING(50)
        },
        salesInvoiceNo : {
            type : DataTypes.STRING(50)
        },
        saleExecutive : {
            type : DataTypes.STRING(50)
        },
        customerName : {
            type : DataTypes.STRING(50)
        },
        customerMobile : {
            type : DataTypes.STRING(50)
        },
        customerEmail : {
            type : DataTypes.STRING(50)
        },
        totalAmount : {
            type : DataTypes.STRING(55)
        },
        returnPolicy : {
            type : DataTypes.STRING(50)
        },
        remarks : {
            type : DataTypes.STRING(50)
        },
        deleteRemark : {
            type : DataTypes.STRING(50)
        },
        approve_b : {
            type : DataTypes.STRING(10),
            defaultValue : 'pending'
        },
        isDeleted: {
            type: DataTypes.STRING, 
            defaultValue: '0',
          },
        rowguid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        customerCity : {
            type : DataTypes.STRING(50)
        },
        customerState : {
            type : DataTypes.STRING(50)
        },
        customerPinCode : {
            type : DataTypes.STRING(50)
        },
        paymentStatus : {
            type : DataTypes.STRING(10)
        },
        paymentMode : {
            type : DataTypes.STRING(50)
        },
        onlineReferenceNo: {
            type: DataTypes.STRING(50),
        },
        onlineChildReferenceNo : {
            type : DataTypes.STRING(50),
        },
        status : {
            type : DataTypes.STRING(50)
        },
        orderRemarks : {
            type : DataTypes.STRING(50)
        },
        Channel : {
            type : DataTypes.STRING(50)
        },
        totalQuantity : {
            type : DataTypes.STRING(50)
        },
        totalFreeQty : {
            type : DataTypes.STRING(50)
        },
        totalTaxAmount : {
            type : DataTypes.STRING(50)
        },
        totalDiscountAmount : {
            type : DataTypes.STRING(50)
        },
        orderDiscPerc : {
            type : DataTypes.STRING(50)
        },
        orderDiscAmt : {
            type : DataTypes.STRING(50)
        },
        courierPartner : {
            type : DataTypes.STRING(50)
        },
        shippingId : {
            type : DataTypes.STRING(50)
        },
        shippingName : {
            type : DataTypes.STRING(50)
        },
        shippingAddress1 : {
            type : DataTypes.TEXT
        },
        shippingAddress2 : {
            type : DataTypes.TEXT
        },
        shippingPlace : {
            type : DataTypes.STRING(20)
        },
        shippingState : {
            type : DataTypes.STRING(20)
        },
        shippingStateCode : {
            type : DataTypes.STRING(20)
        },
        shippingCountry : {
            type : DataTypes.STRING(20)
        },
        shippingPinCode : {
            type : DataTypes.STRING(20)
        },
        shippingPhone : {
            type : DataTypes.STRING(20)
        },
        shippingMobile : {
            type : DataTypes.STRING(20)
        },
        shippingEmail : {
            type : DataTypes.STRING(20)
        },
        shippingCharge : {
            type : DataTypes.STRING(20)
        },
        packingCharge : {
            type : DataTypes.STRING(20)
        },
        shippingMethod : {
            type : DataTypes.STRING(20)
        },
        ShipmentPointsUsed : {
            type : DataTypes.STRING(20)
        },
        shipmentItems : {
            type : DataTypes.STRING(20)
        },
        shipmentABN : {
            type : DataTypes.STRING(20)
        },
        shipmentWeight : {
            type : DataTypes.STRING(20)
        },
        latitude : {
            type : DataTypes.STRING(20)
        },
        longitude : {
            type : DataTypes.STRING(20)
        },
        customeLatitude : {
            type : DataTypes.STRING(20)
        },
        customeLongitude : {
            type : DataTypes.STRING(20)
        },
        discountCoupon: {
            type : DataTypes.STRING(20)
        },
        deliveryDate : {
            type : DataTypes.STRING(20)
        },
        locationId : {
            type : DataTypes.STRING(20)
        },
        userId : {
            type : DataTypes.STRING(20)
        },
        appUserName : {
            type : DataTypes.STRING(20)
        },
        customerCode : {
            type : DataTypes.STRING(20)
        },
        customerId : {
            type : DataTypes.STRING(20)
        },
       
        customerType : {
            type : DataTypes.STRING(20)
        },
        customerAddressLine1 : {
            type : DataTypes.TEXT
        },
        customerAddressLine2 : {
            type : DataTypes.TEXT
        },
        customerAddressLine3 : {
            type : DataTypes.TEXT
        },
        customerArea : {
            type : DataTypes.STRING(20)
        },
        customerCountry : {
            type : DataTypes.STRING(20)
        },
        customerPhone : {
            type : DataTypes.STRING(20)
        },
        ordTimestamp : {
            type : DataTypes.STRING(20)
        },
        isOfflineOrder : {
            type : DataTypes.STRING(20)
        },
        invoiceNo : {
            type : DataTypes.STRING(20)
        },
        deliveryBoy : {
            type : DataTypes.STRING(20)
        },
        deilveryBoyMobileNo : {
            type : DataTypes.STRING(20)
        },
        otherChargesTaxAmount : {
            type : DataTypes.STRING(20)
        },
        otherChargesTaxPercentage : {
            type : DataTypes.STRING(20)
        },
        otherChargesTaxInclusive : {
            type : DataTypes.STRING(20)
        },
        serviceTaxAmount : {
            type : DataTypes.STRING(20)
        },
    })

    return Order
}































