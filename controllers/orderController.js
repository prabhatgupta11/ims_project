const db = require("../models")
const Order = db.order;
const OrderItems = db.orderItems;
const addOrder = async (req, res) => {
// console.log(123)
// console.log(req.body)
    try {
        const info = {
         
          orderPK:req.body.orderPK,
        onlineReferenceNo: req.body.onlineReferenceNo,
        onlineChildReferenceNo : req.body.onlineChildReferenceNo,
        status : req.body.status,
        orderRemarks : req.body.orderRemarks,
        Channel : req.body.Channel,
        totalQuantity : req.body.totalQuantity,
        totalFreeQty : req.body.totalFreeQty,
        totalAmount : req.body.totalAmount,
        paymentMode : req.body.paymentMode,
        paymentMethod:req.body.paymentMethod,
        totalTaxAmount : req.body.totalTaxAmount,
        totalDiscountAmount : req.body.totalDiscountAmount,
        orderDiscPerc : req.body.orderDiscPerc,
        orderDiscAmt : req.body.orderDiscAmt,
        courierPartner : req.body.courierPartner,
        shippingId : req.body.shippingId,
        shippingName : req.body.shippingName,
        shippingAddress1 : req.body.shippingAddress1,
        shippingAddress2 : req.body.shippingAddress2,
        shippingPlace : req.body.shippingPlace,
        shippingState : req.body.shippingState,
        shippingStateCode : req.body.shippingStateCode,
        shippingCountry : req.body.shippingCountry,
        shippingPinCode : req.body.shippingPinCode,
        shippingPhone : req.body.shippingPhone,
        shippingMobile : req.body.shippingMobile,
        shippingEmail : req.body.shippingEmail,
        shippingCharge : req.body.shippingCharge,
        packingCharge : req.body.packingCharge,
        shippingMethod : req.body.shippingMethod,
        ShipmentPointsUsed : req.body.ShipmentPointsUsed,
        shipmentItems : req.body.shipmentItems,
        shipmentABN : req.body.shipmentABN,
        shipmentWeight : req.body.shipmentWeight,
        latitude : req.body.latitude,
        longitude : req.body.longitude,
        customeLatitude : req.body.customeLatitude,
        customeLongitude : req.body.customeLongitude,
        discountCoupon: req.body.discountCoupon,
        deliveryDate : req.body.deliveryDate,
        locationId : req.body.locationId,
        userId : req.body.userId,
        appUserName : req.body.appUserName,
        customerCode : req.body.customerCode,
        customerId : req.body.customerId,
        customerName : req.body.customerName,
        customerType : req.body.customerType,
        customerAddressLine1 : req.body.customerAddressLine1,
        customerAddressLine2 : req.body.customerAddressLine2,
        customerAddressLine3 : req.body.customerAddressLine3,
        customerArea : req.body.customerArea,
        customerCity : req.body.customerCity,
        customerState : req.body.customerState,
        customerCountry : req.body.customerCity,
        customerPinCode : req.body.customerPinCode,
        customerPhone : req.body.customerPhone,
        customerMobile : req.body.customerMobile,
        customerEmail : req.body.customerEmail,
        ordTimestamp : req.body.ordTimestamp,
        outletId : req.body.outletId,
        isOfflineOrder : req.body.isOfflineOrder,
        invoiceNo : req.body.invoiceNo,
        deliveryBoy : req.body.deliveryBoy,
        deilveryBoyMobileNo : req.body.deilveryBoyMobileNo,
        otherChargesTaxAmount : req.body.otherChargesTaxAmount,
        otherChargesTaxPercentage : req.body.otherChargesTaxPercentage,
        otherChargesTaxInclusive : req.body.otherChargesTaxInclusive,
        serviceTaxAmount : req.body.serviceTaxAmount
        
    }


    console.log(info)
    const orderbill = await Order.create(info)


    const info2= [{
      //   orderid: req.body.orderid,
        rowNo: req.body.rowNo,
      //   id :req.body.id,
        itemId :req.body.itemId,
        itemName : req.body.product,
        itemReferenceCode : req.body.itemReferenceCode,
        salePrice : req.body.price,
        quantity : req.body.quantity,
        suppliedQty : req.body.suppliedQty,
        itemAmount : req.body.total,
        iBarU :req.body.iBarU,
        taxPercentage : req.body.taxPercentage,
        itemTaxType : req.body.itemTaxType,
        discountPercentage : req.body.discount,
        itemRemarks : req.body.itemRemarks,
        itemMarketPrice : req.body.itemMarketPrice,
        freeQty :req.body.freeQty,
        orderPK : req.body.orderPK,
        aggregatorPaid :req.body.aggregatorPaid,
        // created_at :req.body.created_at,
        // updated_at : req.body.updated_at, 
    }, ]
    
  
   
 


    console.log("this is data",info2)
    
    const orderItemsWithPK = info2.map((item) => ({
      ...item,
      orderPK: orderbill.orderPK,
    }));

    await OrderItems.bulkCreate(orderItemsWithPK);

    // const orderbill2 = await OrderItems.create(info2)

          req.flash('message', 'Billing information added successfully');
        return res.redirect('/billing');
      } catch (err) {
        console.error(err);
        res.status(500).send({
          success: false,
          message: err.message
        });
      }
    };




    module.exports = {
        addOrder
    };