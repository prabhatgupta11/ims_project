const db = require("../models")
const Order = db.orderItems;


const addOrderItem = async (req, res) => {
console.log(123)
console.log(req.body)
    try {
        const info = {
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
    }

        console.log(info)
    const orderbill = await Order.create(info)
    
        // const orderbill = await Order.update({
        //   customerName,
        //   customerMobile,
        //   customerEmail,
        //   customerCity,
        //   shippingState,
        //   shippingPinCode,
        //   paymentMethod
        // });
    
        console.log(orderbill);
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

// Function to add an order item
// const addOrderItem = async (req, res) => {
//   try {
//       // Iterate through the array of products and add each product as an order item
//       const products = req.body.products;
//       const orderItems = [];

//       for (const product of products) {
//           const orderItem = {
//               rowNo: product.rowNo,
//               itemId: product.itemId,
//               itemName: product.product,
//               itemReferenceCode: product.itemReferenceCode,
//               salePrice: product.price,
//               quantity: product.quantity,
//               suppliedQty: product.suppliedQty,
//               itemAmount: product.total,
//               iBarU: product.iBarU,
//               taxPercentage: product.taxPercentage,
//               itemTaxType: product.itemTaxType, 
//               discountPercentage: product.discount,
//               itemRemarks: product.itemRemarks,
//               itemMarketPrice: product.itemMarketPrice,
//               freeQty: product.freeQty,
//               orderPK: product.orderPK,
//               aggregatorPaid: product.aggregatorPaid,
//           };
//           orderItems.push(orderItem);
//       }

//       // Bulk create order items
//       await Order.bulkCreate(orderItems);

//       // Redirect or respond with a success message
//       req.flash('message', 'Order items added successfully');
//       return res.redirect('/billing');
//   } catch (err) {
//       console.error(err);
//       res.status(500).send({
//           success: false,
//           message: err.message
//       });
//   }
// };


    module.exports = {
        addOrderItem
    };


    