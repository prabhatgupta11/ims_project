
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

const updateTax = async (req, res) => {
  try {

    console.log(88888888888,req.body)
      const newTax = await TaxMaster.update({...req.body},{where:{rowguid:req.params.uuid}});
      req.flash('message', 'Tax updated successfully')
      return res.redirect("/taxMasterList")
    }
  
    catch (error) {
      console.error('Error creating tax:', error);
      return res.status(500).json({ error: 'Could not create tax' });
    }
  
  }
  



module.exports = {
    createTax,
    supplierData,
    updateTax,

}