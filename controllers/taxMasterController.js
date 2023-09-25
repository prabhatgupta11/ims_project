
const db = require("../models")
const TaxMaster =db.tax;

const createTax = async (req, res) => {
try {
    const newtax = await TaxMaster.create(req.body);
    // return res.status(201).json(newSupplier);
   req.flash('message', 'Tax  created successfully')
    return res.redirect("/taxMasterList")


  }

  catch (error) {
    console.error('Error creating tax:', error);
    return res.status(500).json({ error: 'Could not create tax' });
  }

}


const supplierData=async(req,res)=>{
  try{
     const Allsuplier=await TaxMaster.findAll();
     return res.status(201).json(Allsuplier);
  }catch(err){
    return res.status(500).json({ error: 'Could not fund all supplier' });
  }
}

const updateSuplier = async (req, res) => {
  try {
      const newSupplier = await TaxMaster.update({...req.body},{where:{rowguid:req.params.uuid}});
      req.flash('message', 'supplier updated successfully')
      return res.redirect("/suppliersMasterList")
    }
  
    catch (error) {
      console.error('Error creating supplier:', error);
      return res.status(500).json({ error: 'Could not create supplier' });
    }
  
  }
  



module.exports = {
    createTax,
    supplierData,
    updateSuplier,

}