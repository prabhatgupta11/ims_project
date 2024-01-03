const db = require("../models");
const SalesExecutive = db.salesExecutive;
const AutoGenerateNumber = db.autoGenerateNumber;

const createSalesExecutive = async (req, res) => {
  try {
    console.log(req.body);

    const info = {
      name : req.body.Name,
      contactNo : req.body.ContactNo,
      email : req.body.Email,
      address : req.body.Address,
      storeFk : req.body.outletId
    }
    const salesExecutive = await SalesExecutive.create(info);
    // return res.status(201).json(newSupplier);
    req.flash("message", "sales Executive created successfully");
    return res.redirect("/salesExecutiveList");
  } catch (error) {
    console.log("Error creating supplier:", error);
    req.flash("message", "Something went wrong ! Please try again ");
    return res.redirect("/salesExecutiveList");
  }
};

const SalesExecutiverData = async (req, res) => {
  try {
    const Allsuplier = await SupplierMaster.findAll();
    return res.status(201).json(Allsuplier);
  } catch (err) {
    return res.status(500).json({ error: "Could not fund all supplier" });
  }
};

const updateSalesExecutive = async (req, res) => {
  try {
    console.log(req.body)
    const salesExecutive = await SalesExecutive.update(
      { ...req.body},
      { where: { rowguid: req.params.uuid } }
    );
    req.flash("message", "SalesExecutive updated successfully");
    return res.redirect("/salesExecutiveList");
  } catch (error) {
    console.error("Error creating supplier:", error);
    return res.status(500).json({ error: "Could not create SalesExecutive" });
  }
};

module.exports = {
  createSalesExecutive,
  SalesExecutiverData ,
  updateSalesExecutive,
};
