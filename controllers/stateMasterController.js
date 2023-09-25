const db = require("../models")
const StateMaster =db.stateMaster;

const createStateMaster = async (req, res) => {
  try {
    console.log(50500000, req.body);
    const newStateMaster = await StateMaster.create(req.body);
    return res.status(201).json(newStateMaster);
  } catch (error) {
    console.error('Error creating State Master:', error.message);
    return res.status(500).json({ error: 'Could not create state Mster', message: error.message });
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

const updateStateMaster = async (req, res) => {
  try {
      const newStateMaster = await StateMaster.update({...req.body},{where:{rowguid:req.params.uuid}});
      return res.redirect("/stateMasterList")
    }
  
    catch (error) {
      console.error('Error creating storeMaster:', error);
      return res.status(500).json({ error: 'Could not create storeMaster' });
    }
  
  }
  



module.exports = {
    createStateMaster,
    supplierData,
    updateStateMaster,

}