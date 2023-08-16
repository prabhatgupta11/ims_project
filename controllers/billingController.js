// billingController.js
const db = require('../models');
const Billing = db.billing;

const createBill = async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      email,
      city,
      state,
      pincode,
      paymentMethod
    } = req.body;

    const billing = await Billing.create({
      customerName,
      customerMobile,
      email,
      city,
      state,
      pincode,
      paymentMethod
    });

    // console.log(billing);
    req.flash('message', 'Billing information added successfully');
    return res.redirect('/billing2');
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createBill
};
