const db = require("../models")
// const Store = db.store;
const Store = db.store
const User = db.user
const CodeMaster = db.codeMaster
const StoreCategoryMapping = db.storeCategoryMapping
const UserStoreMapping = db.userStoreMapping
const AutoGenerateNumber = db.autoGenerateNumber


// const createStore = async (req, res) => {

//   try {

//     let info = {
//       outletId,
//       storeName,
//       storeAddress,
//       approve_b,
//       approve_by,
//       approve_date
//     } = req.body

//     const store = await Store.create(info)

//     req.flash('message', 'Store added Successfully and Sent for Approval');
//     return res.redirect('/storeList')

//   }

//   catch (err) {
//     req.flash('message', 'Something Went Wrong');
//     return res.redirect('/storeMaster')
//   }

// }

// Get All Store Details
const getAllStoreDetails = async (req, res) => {
  const stores = await Store.findAll()
  res.status(200).send({
    success: true,
    stores
  })
}


// Update Store Details

// const updateStore = async (req, res) => {

//   try {

//     const store = await Store.update({ ...req.body, approve_b: 'pending' }, { where: { outletId: req.params.id } })

//     if (!store) {
//       res.status(200).send({
//         success: false,
//         message: "Store Not Found"
//       })
//     }

//     req.flash('message', 'Store updated successfully and sent for Approval');
//     return res.redirect('/storeList')

//   } catch (err) {
//     console.log(err.message)
//     req.flash('message', 'Something Went Wrong');
//     return res.redirect('/storeMaster')
//   }

// }


//   store Approval List

const storeApprovalList = async function (req, res) {
  const approvalStatus = req.query.approvalStatus; // Get the approval status from query parameter

  let whereClause = {};

  if (approvalStatus === 'pending') {
    whereClause = { approve_b: 'pending' };
  } else if (approvalStatus === 'approved') {
    whereClause = { approve_b: "approved" };
  } else if (approvalStatus === 'rejected') {
    whereClause = { approve_b: "rejected" };
  }

  const store = await Store.findAll({ where: whereClause });

  res.render('approval/storeApprovalList', { title: 'Express', message: req.flash('message'), store });
}

const updateStoreApprovalStatus = async (req, res) => {
  console.log(123456)
  const { action, selectedStoreIds } = req.body;
  if (action === 'approved' || action === 'rejected') {

    selectedStoreIds.forEach(async outletId => {
      try {
        // Find the category by ID using Sequelize
        const store = await Store.findByPk(outletId);

        if (store) {
          // Update the approval status of the category
          await Store.update({ approve_b: action }, { where: { outletId: outletId } });
        }

        req.flash('message', `Checked approval requests are ${action}`)
        return res.redirect('/storeApprovalList')

      } catch (err) {
        console.log(err.message)
        req.flash('message', 'Something went wrong')
        return res.redirect('/storeApprovalList')
      }

    });
  }
}


const createNewStore = async function (req, res) {
  if(req.session.userDetail.role == undefined){
    req.flash('message', "Session is expired please login again")
    return res.redirect('/')
  }

  if(req.session.userDetail.role == 'admin' || req.session.userDetail.role == 'user' ){
    req.flash('message', 'You can not create store only super admin can do this')
    return res.redirect('/newStore')
  }

  const selectedCategoryIds = req.body.category; //ids in array
 if(selectedCategoryIds == undefined){
req.flash('message', 'Please select category first if category is not showing then create category first')
return res.redirect('/newStore')
 }
  try {
    let info = {
      outletId,
      code,
      storeName,
      businessType,
      address1,
      address2,
      state,
      pincode,
      contactPersonName,
      contactNo1,
      contactNo2,
      GSTNo,
      panNo,
      taxState,
      status,
      displayOrder,
      edit_by,
      edit_on,
      approve_b,
      approve_by,
      rowguid
    } = req.body

    const newStore = await Store.create(info)

     const selectedStoreId = newStore.outletId; 
    
     const store = await Store.findByPk(selectedStoreId);

    // Create associations between the user and selected stores
    for (const selectedCategoryId of selectedCategoryIds) {
      const category = await CodeMaster.findByPk(selectedCategoryId);
      if (category) {
        // Create a UserStoreMapping entry
        await StoreCategoryMapping.create({
          storeFk: store.outletId,
          categoryFk: category.id
        });
      }
    }
    if (req.session.userDetail.role == 'super admin'){
      await UserStoreMapping.create({
        userFk: req.session.userDetail.id,
        storeFk: newStore.outletId
      });
    }
    req.flash('message', 'Store added Successfully');
    return res.redirect('/newStoreList')

  }

  catch (err) {
    console.log(err)
    req.flash('message', 'Something Went Wrong');
    return res.redirect('/newStore')
  }

}

// api for application create store
const createAppStore = async function (req, res) {
  try {

    const userId = req.params.userId
    const user = await User.findOne({where : {id :userId}})

    if (!user) {
      return res.status(404).json({
        success : false,
        message : 'User not found'
      });
    }
  
    // Role Check
    if (user.role === 'admin' || user.role === 'user') {
      return res.status(403).json({ 
        success : false,
        message: 'You cannot create a store, only super admin can do this' });
    }
    let getCode = await AutoGenerateNumber.findOne({ where: { prefix: "STO" } })

        // Increment the lastno value and pad it to 6 digits
        const newLastNo = (parseInt(getCode.lastNo) + 1).toString().padStart(6, '0');
        
        // Construct the unique identifier string
        const generateCode = `${getCode.prefix}/${newLastNo}/${getCode.suffix}`;

          // Update the lastno value in the database
          const updateGenerateCode = await AutoGenerateNumber.update(
            { lastNo: newLastNo  },
            { where: { id: getCode.id } }
          );

    const {
      outletId,
      storeName,
      businessType,
      address1,
      address2,
      state,
      pincode,
      contactPersonName,
      contactNo1,
      contactNo2,
      GSTNo,
      panNo,
      taxState,
      status,
      displayOrder,
      edit_by,
      edit_on,
      approve_b,
      approve_by,
      rowguid
    } = req.body

    const info = {
      outletId,
      code : generateCode,
      storeName,
      businessType,
      address1,
      address2,
      state,
      pincode,
      contactPersonName,
      contactNo1,
      contactNo2,
      GSTNo,
      panNo,
      taxState,
      status,
      displayOrder,
      edit_by,
      edit_on,
      approve_b,
      approve_by,
      rowguid
    }
    

    const selectedCategoryIds = req.body.category;

    // Category Check
    if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
      return res.status(400).json(
      { 
        success : false,
        message: 'Please select a category. If the category is not showing, create a category first' 
      });
    }

    if(!req.body.storeName){
      return res.status(400).json({ 
        success : false,
        message: 'Store Name field can not be blank'
       });
    }

    if(!req.body.businessType){
      return res.status(400).json({ 
        success : false,
        message: 'Business Type field can not be blank'
       });
    }

    if(!req.body.contactNo1){
      return res.status(400).json({ 
        success : false,
        message: 'Contact No.1 field can not be blank'
       });
    }


    const newStore = await Store.create(info)

     const selectedStoreId = newStore.outletId; 
    
     const store = await Store.findByPk(selectedStoreId);

    // Create associations between the user and selected stores
    for (const selectedCategoryId of selectedCategoryIds) {
      const category = await CodeMaster.findByPk(selectedCategoryId);
      if (category) {
        // Create a UserStoreMapping entry
        await StoreCategoryMapping.create({
          storeFk: store.outletId,
          categoryFk: category.id
        });
      }
    }
    // If the user has the role of 'super admin', create a UserStoreMapping entry
    if (user.role === 'super admin') {
      await UserStoreMapping.create({
        userFk: user.id,
        storeFk: newStore.outletId
      });
    }

    return res.status(201).json({
      success : true, 
      message: 'Store added successfully', 
      store: newStore 
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ 
      success : false,
      message: "Something went wrong" });
  }
}

const updateNewStore = async (req, res) => {
  try {
    
    if(req.session.userDetail.role == 'admin' || req.session.userDetail.role == 'user' ){
      req.flash('message', 'You can not update store only super admin can do this')
      return res.redirect('/newStoreList')
    }

    const store = await Store.findOne({ where: { rowguid: req.params.id } });

    if (!store) {
      // Handle the case where the store with the given ID doesn't exist
      req.flash('message', 'Store not found');
      return res.redirect('/newStoreList');
    }

    
    const selectedCategoryIds = req.body.category; 

    if(selectedCategoryIds == undefined){
      req.flash('message', 'Please Select Category for this Store');
      return res.redirect(`/updateNewStore/${req.params.id}`);
    }

    // Update the store's information
    await store.update({ ...req.body, approve_b: 'pending' });

   

    if (selectedCategoryIds.length === 0) {
      // If no categories are selected, remove all existing category associations
      await StoreCategoryMapping.destroy({ where: { storeFk: store.outletId } });
      req.flash('message', 'Store updated successfully');
    } else {
      // Remove existing category associations for this store
      await StoreCategoryMapping.destroy({ where: { storeFk: store.outletId } });

      // Create associations between the store and selected categories
      for (const selectedCategoryId of selectedCategoryIds) {
        const category = await CodeMaster.findByPk(selectedCategoryId);

        if (category) {
          // Create a StoreCategoryMapping entry
          await StoreCategoryMapping.create({
            storeFk: store.outletId,
            categoryFk: category.id
          });
        }
      }
      req.flash('message', 'Store updated successfully');
    }

    return res.redirect('/newStoreList');
  } catch (err) {
    console.error(err);
    req.flash('message', 'Something Went Wrong');
    return res.redirect(`/updateNewStore/${req.params.id}`);
  }
};

// api for application update store

const updateAppStore = async (req, res) => {
  try {

    const userId = req.params.userId
    const user = await User.findOne({where : {id :userId}})

    if (!user) {
      return res.status(404).json({
        success : false,
        message : 'User not found'
      });
    }
  
    // Role Check
    if (user.role === 'admin' || user.role === 'user') {
      return res.status(400).json({ 
        success : false,
        message: 'You cannot update a store, only super admin can do this' });
    }

    const store = await Store.findOne({ where: { rowguid: req.params.storeId } });

    if (!store) {
      return res.status(404).json({ 
        success : false,
        message: 'Store not found' });
    }

    const selectedCategoryIds = req.body.category;

    if (selectedCategoryIds === undefined || selectedCategoryIds.length === 0) {
      return res.status(400).json({ 
        success : false,
        message: 'Please select a category for this store' });
    }

    if (!req.body.storeName){
      return res.status(400).json({ 
        success : false,
        message: 'Store Name field can not be blank'
       });
    }

    if (!req.body.businessType){
      return res.status(400).json({ 
        success : false,
        message: 'Business Type field can not be blank'
       });
    }

    if (!req.body.contactNo1){
      return res.status(400).json({ 
        success : false,
        message: 'Contact No.1 field can not be blank'
       });
    }

    // Update the store's information
   const updateStore = await store.update({ ...req.body, approve_b: 'pending' });

    if (selectedCategoryIds.length === 0) {
      // If no categories are selected, remove all existing category associations
      await StoreCategoryMapping.destroy({ where: { storeFk: store.outletId } });
      return res.status(200).json({ message: 'Store category updated successfully' });
    } else {
      // Remove existing category associations for this store
      await StoreCategoryMapping.destroy({ where: { storeFk: store.outletId } });

      // Create associations between the store and selected categories
      for (const selectedCategoryId of selectedCategoryIds) {
        const category = await CodeMaster.findByPk(selectedCategoryId);

        if (category) {
          // Create a StoreCategoryMapping entry
          await StoreCategoryMapping.create({
            storeFk: store.outletId,
            categoryFk: category.id
          });
        }
      }
      return res.status(200).json({
         success : true,
         message: 'Store updated successfully',
         store : updateStore });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ 
      success : false,
      message: 'Something went wrong' });
  }
};


module.exports = {
  createNewStore,
  updateNewStore,
  createAppStore,
  getAllStoreDetails,
  updateAppStore,
  storeApprovalList,
  updateStoreApprovalStatus
}