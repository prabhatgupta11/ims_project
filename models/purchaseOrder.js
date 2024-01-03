const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const PurchaseOrder = sequelize.define('purchase_order', {
        orderId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        purchaseInvoiceId: {
            type: DataTypes.STRING,
            defaultValue: '-1'
        },
        orderType: {
            type: DataTypes.STRING,
            defaultValue: 'order'
        },
        stockType: {
            type: DataTypes.STRING(10)
        },
        purchaseOrderNo: {
            type: DataTypes.STRING(50)
        },
        outletId: {
            type: DataTypes.STRING
        },
        orderDate: {
            type: DataTypes.STRING,
        },
        customerName: {
            type: DataTypes.STRING(50)
        },
        customerMobile: {
            type: DataTypes.STRING(50)
        },
        customerEmail: {
            type: DataTypes.STRING(50)
        },
        totalAmount: {
            type: DataTypes.STRING(55)
        },
        remarks: {
            type: DataTypes.STRING(50)
        },
        deleteRemark: {
            type: DataTypes.STRING
        },
        approve_b: {
            type: DataTypes.STRING(10),
            defaultValue: 'pending'
        },
        isDeleted: {
            type: DataTypes.STRING,
            defaultValue: '0',
        },
        isInvoiceGenerated: {
            type: DataTypes.STRING,
            defaultValue: '0',
        },
        rowguid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.STRING(20)
        },
        customerCity: {
            type: DataTypes.STRING(50)
        },
        customerState: {
            type: DataTypes.STRING(50)
        },
        customerPinCode: {
            type: DataTypes.STRING(50)
        },
        paymentStatus: {
            type: DataTypes.STRING(10)
        },
        paymentMode: {
            type: DataTypes.STRING(50)
        },
        onlineReferenceNo: {
            type: DataTypes.STRING(50),
        },
        onlineChildReferenceNo: {
            type: DataTypes.STRING(50),
        },
        status: {
            type: DataTypes.STRING(50)
        },
        orderRemarks: {
            type: DataTypes.STRING(50)
        },
        Channel: {
            type: DataTypes.STRING(50)
        },
        totalQuantity: {
            type: DataTypes.STRING(50)
        },
        totalFreeQty: {
            type: DataTypes.STRING(50)
        },
        totalTaxAmount: {
            type: DataTypes.STRING(50)
        },
        totalDiscountAmount: {
            type: DataTypes.STRING(50)
        },
        orderDiscPerc: {
            type: DataTypes.STRING(50)
        },
        orderDiscAmt: {
            type: DataTypes.STRING(50)
        },
        courierPartner: {
            type: DataTypes.STRING(50)
        },
        shippingId: {
            type: DataTypes.STRING(50)
        },
        shippingName: {
            type: DataTypes.STRING(50)
        },
        shippingAddress1: {
            type: DataTypes.TEXT
        },
        shippingAddress2: {
            type: DataTypes.TEXT
        },
        shippingPlace: {
            type: DataTypes.STRING(20)
        },
        shippingState: {
            type: DataTypes.STRING(20)
        },
        shippingStateCode: {
            type: DataTypes.STRING(20)
        },
        shippingCountry: {
            type: DataTypes.STRING(20)
        },
        shippingPinCode: {
            type: DataTypes.STRING(20)
        },
        shippingPhone: {
            type: DataTypes.STRING(20)
        },
        shippingMobile: {
            type: DataTypes.STRING(20)
        },
        shippingEmail: {
            type: DataTypes.STRING(20)
        },
        shippingCharge: {
            type: DataTypes.STRING(20)
        },
        packingCharge: {
            type: DataTypes.STRING(20)
        },
        shippingMethod: {
            type: DataTypes.STRING(20)
        },
        ShipmentPointsUsed: {
            type: DataTypes.STRING(20)
        },
        shipmentItems: {
            type: DataTypes.STRING(20)
        },
        shipmentABN: {
            type: DataTypes.STRING(20)
        },
        shipmentWeight: {
            type: DataTypes.STRING(20)
        },
        latitude: {
            type: DataTypes.STRING(20)
        },
        longitude: {
            type: DataTypes.STRING(20)
        },
        customeLatitude: {
            type: DataTypes.STRING(20)
        },
        customeLongitude: {
            type: DataTypes.STRING(20)
        },
        discountCoupon: {
            type: DataTypes.STRING(20)
        },
        deliveryDate: {
            type: DataTypes.STRING(20)
        },
        locationId: {
            type: DataTypes.STRING(20)
        },

    })

    return PurchaseOrder
}































