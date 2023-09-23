const db = require("../models")
// const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
// const config = require("../config/auth.config")
const User = db.user
const Store = db.store
const UserStoreMapping = db.userStoreMapping
const session = require('express-session');

// Register User

const registerUser = async (req, res) => {

  const { firstName, lastName, email, mobileNumber, manager } = req.body
  if (!firstName || !lastName || !email || !mobileNumber) {
    req.flash('message', 'All fields must have value')
    return res.redirect('/register')
  }

  const isEmailAvailable = await User.findOne({
    where: { email: email }
  })

  if (isEmailAvailable) {
    req.flash('message', 'Email already exist')
    return res.redirect('/register')
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: bcrypt.hashSync(req.body.password, 8),
    mobileNumber
  });

  req.session.user = user

  req.flash('message', 'You are now Register Successfully.');
  return res.redirect('/')

}


//  Login User

const loginUser = async (req, res) => {

  const { email, password } = req.body

  if (!email || !password) {
   req.flash('error', 'Opssss....Please Enter Email and Password Properly');
    return res.redirect('/')
  }

  const user = await User.findOne({ where: { email: req.body.email } })

  if (!user) {
    req.flash('error', 'Awww....User Is Not Valid');
    return res.redirect('/')
  }

  let passwordIsValid = bcrypt.compareSync(
    req.body.password,
    user.password
  );

  if (!passwordIsValid) {
    req.flash('error', 'Opsss...You Entered Wrong Password');
    return res.redirect('/')
  }

  // let token = jwt.sign({ id: user.id }, config.secret, {
  //   expiresIn: "24H" // 24 hours
  // });

  // return res.status(200).send({
  //   success : true,
  //   username : user.firstName + " " + user.lastName,
  //   accessToken: token
  // })

  req.session.isLoggedIn = true
  req.session.userDetail = {
    id: user.id,
    role: user.role
  }
  req.flash('message', 'You are now login Successfully.');
  res.redirect('/dashboard')
}


// Create User

const createUser = async (req, res) => {

  try {
// console.log(123,req.body)
    const { firstName, lastName, email, mobileNumber, role, password, managerFk } = req.body

    if (!firstName || !lastName || !email || !mobileNumber || !password) {
      req.flash('message', 'All fields must have value')
      return res.redirect('/user')
    }

    const isEmailAvailable = await User.findOne({
      where: { email: email }
    })

    if (isEmailAvailable) {
      req.flash('message', 'Email already exist')
      return res.redirect('/user')
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(req.body.password, 8),
      mobileNumber,
      role,
      managerFk
    });

    const selectedUserId = user.id;
    const selectedStoreIds = req.body.outletId; // An array of selected ouletIds
    
      
      const manager = await User.findByPk(selectedUserId);
  
     if(manager){
      for (const selectedStoreId of selectedStoreIds) {
        const store = await Store.findByPk(selectedStoreId);
        if (store) {
          await UserStoreMapping.create({
            userFk: user.id,
            storeFk: store.outletId
          });
        } 
    }
     }else {
      req.flash('message', 'User Added Successfully But You do not assign store to this user');
    return res.redirect('/userList') 
     }
        
      
    // req.session.user = user

    req.flash('message', 'User Added Successfully.');
    return res.redirect('/userList')  

  } catch (err) {
    console.log(err)
    req.flash('message', 'Something went wrong')
    return res.redirect('/user')
  }
}


// Update user

const updateUser = async (req, res) => {
  try {
    console.log(req.body)
   let managerFk = req.body.managerFk
   if (managerFk == ""){
    managerFk = -1
   }
    const user = await User.update({ ...req.body, managerFk:managerFk}, { where: { id: req.params.id } })
    
    const selectedUserId = req.params.id;
    const selectedStoreIds = req.body.outletId; // An array of selected ouletIds
    console.log(selectedStoreIds)
      const manager = await User.findByPk(selectedUserId);
  
      if(manager){
        for (const selectedStoreId of selectedStoreIds) {
          
          const store = await Store.findByPk(selectedStoreId);
          if (store) {
            await UserStoreMapping.upsert({
              userFk: manager.id,
              storeFk: store.outletId
            },{where : {userFk : req.params.id}});
          }
        }
      }else{
        req.flash('message', 'User Details updated successfully but you do not assign store to this user');
        return res.redirect('/userList') 
      }
      
    // req.session.user = user
  
    req.flash('message', 'User Details updated successfully');
    return res.redirect('/userList')
  } catch (err){
    console.log(err)
    req.flash('message', 'Something went wrong')
    return res.redirect(`/userUpdate/${req.params.id}`)
  } 
}


module.exports = {
  registerUser,
  loginUser,
  createUser,
  updateUser
}