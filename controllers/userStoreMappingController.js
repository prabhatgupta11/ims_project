const db = require("../models")
// const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
// const config = require("../config/auth.config")
const User = db.user
const Store = db.store
const UserStoreMapping = db.userStoreMapping
const session = require('express-session');


//  get user store data from database and show into selected checkbox

const getUserStoreData = async (req, res) => {
  console.log(456)
  const userId = req.params.userId;
  try {

    const user = await User.findOne({ id: userId })
    if (!user) {
      console.log(123, 'user not found')
    }

    const userRole = user.role

    let storeIdsToFetch = []

    if (userRole === 'super admin') {
      const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
      storeIdsToFetch = userStoreMapping.map(mapping => mapping.storeFk)
      console.log(123456, storeIdsToFetch)
    } else if (userRole === 'admin') {
      const managedStoreIds = await UserStoreMapping.findAll({ where: { userFk: userId } });
      storeIdsToFetch = managedStoreIds.map(mapping => mapping.storeFk);
    }

    const store = await Store.findAll({ where: { outletId: storeIdsToFetch, approve_b: 'approved' } })

    // let selectedStore = await UserStoreMapping.findAll({ where: { userFk: userId } })
    console.log(123, storeIdsToFetch, store)

    let arr = []
    let userStoreIds = []


    // for (i = 0; i < selectedStore.length; i++) {
    //   userStoreIds.push(selectedStore[i].storeFk)
    // }

    // function onlyUnique(value, index, array) {
    //   return array.indexOf(value) === index;
    // }
    // var unique = userStoreIds.filter(onlyUnique);


    for (i = 0; i < store.length; i++) {
      let flag = false

      for (let j = 0; j < storeIdsToFetch.length; j++) {
        if (store[i].outletId == storeIdsToFetch[i]) {
          flag = true
        }
      }

      if (flag == true) {
        arr.push({ ...store[i].dataValues, checked: true })
      }
      else {
        arr.push({ ...store[i].dataValues, checked: false })
      }
    }


    res.json(arr);
  } catch (error) {
    console.log(error)
    req.flash('message', 'Internal Server error');
    return res.redirect('/userStoreMapping')
  }
}


// select store in check box and store into userStoreMapping

const addUserStoreMapping = async (req, res) => {
  console.log(123456789)
  const selectedUserId = req.body.id;
  const selectedStoreIds = req.body.outletId; // An array of selected ouletIds
  try {
    // Find the user by selectedUserId
    const user = await User.findByPk(selectedUserId);

    // Create associations between the user and selected stores
    for (const selectedStoreId of selectedStoreIds) {
      const store = await Store.findByPk(selectedStoreId);
      if (store) {
        // Create a UserStoreMapping entry
        await UserStoreMapping.create({
          userFk: user.id,
          storeFk: store.outletId
        });
      }
    }
    req.flash('message', 'Added stores for this user Sucessfully.');
    return res.redirect('/userStoreMapping')

  } catch (error) {
    console.log(error)
    req.flash('message', 'Something went wrong');
    return res.redirect('/userStoreMapping')
  }
}


// deselect a store 

const deselectStore = async (req, res) => {

  const userId = req.params.userId;
  const outletId = req.params.outletId;

  try {
    // Remove the store from the UserStoreMapping table
    const removeStore = await UserStoreMapping.destroy({ where: { userFk: userId, storeFk: outletId } });

    req.flash('message', 'stores update Sucessfully.')
    return res.redirect('/userStoreMapping')

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// User Store Management Approval List

const userStoreMappingApprovalList = async function (req, res) {

  const approvalStatus = req.query.approvalStatus; // Get the approval status from query parameter

  let whereClause = {};

  if (approvalStatus === 'pending') {
    whereClause = { approve_b: null };
  } else if (approvalStatus === 'approved') {
    whereClause = { approve_b: "approved" };
  } else if (approvalStatus === 'rejected') {
    whereClause = { approve_b: "rejected" };
  }

  const userStore = await UserStoreMapping.findAll({ where: whereClause });

  res.render('approval/userStoreMappingApprovalList', { title: 'Express', message: req.flash('message'), userStore });
}

const updateUserStoreMappingApprovalStatus = async (req, res) => {

  const { action, selectedUserIds } = req.body;
  if (action === 'approved' || action === 'rejected') {
    selectedUserIds.forEach(async userFk => {
      try {
        // Find the category by ID using Sequelize
        const userStore = await UserStoreMapping.findByPk(userFk);

        if (userStore) {
          // Update the approval status of the category
          await UserStoreMapping.update({ approve_b: action }, { where: { userFk: userFk } });
        }
      } catch (err) {
        console.log(err.message)
        req.flash('message', 'Internal Server error');
        return res.redirect('/userStoreMappingApprovalList')
      }

    });
  }
}


module.exports = {
  addUserStoreMapping,
  getUserStoreData,
  deselectStore,
  userStoreMappingApprovalList,
  updateUserStoreMappingApprovalStatus

}