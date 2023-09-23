
const db = require("../models")
const SupplierMaster =db.supplier;

const createSuplier = async (req, res) => {
  try {
    console.log(50500000, req.body);
    const newSupplier = await SupplierMaster.create(req.body);
    return res.status(201).json(newSupplier);
  } catch (error) {
    console.error('Error creating supplier:', error.message);
    return res.status(500).json({ error: 'Could not create supplier', message: error.message });
  }
}



const supplierData=async(req,res)=>{
  try{
     const Allsuplier=await SupplierMaster.findAll();
     return res.status(201).json(Allsuplier);
  }catch(err){
    return res.status(500).json({ error: 'Could not fund all supplier' });
  }
}

const updateSuplier = async (req, res) => {
  try {
      const newSupplier = await SupplierMaster.update({...req.body},{where:{rowguid:req.params.uuid}});
      return res.redirect("/suppliersMasterList")
    }
  
    catch (error) {
      console.error('Error creating supplier:', error);
      return res.status(500).json({ error: 'Could not create supplier' });
    }
  
  }
  



module.exports = {
    createSuplier,
    supplierData,
    updateSuplier,

}