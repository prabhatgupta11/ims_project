let express = require('express');
let router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const userController = require("../controllers/userController");
const salesExecutiveController = require("../controllers/salesExecutiveController")
const productController = require("../controllers/productController");
const storeController = require("../controllers/storeController")
const productStockController = require('../controllers/productStockController')
const productRaiseController = require("../controllers/productRaiseController")
const stockInOutController = require("../controllers/stockInOutController")
const manufacturerController = require("../controllers/manufacturerController")
const categoryController = require("../controllers/categoryMasterController")
const productRaise = require('../controllers/productRaiseController');
const productCategoryMapping = require('../controllers/productCategoryMappingController')
const userStoreMapping = require("../controllers/userStoreMappingController")
const storeCategoryMapping = require("../controllers/storeCategoryMapping")
const orderController = require("../controllers/orderController")
const supplierMasterController = require("../controllers/suplierMasterController")
const stateMasterController = require("../controllers/stateMasterController")
const taxMasterController = require("../controllers/taxMasterController")
const customerMasterController = require("../controllers/customerMasterController")
const codeMasterController = require("../controllers/codeMasterController")
const checkUser = require("../middleware/checkUser")
// const userActivity = require("../middleware/userActivity")
const db = require("../models");
const NewProduct = db.newProduct
const ProductImage = db.productImage
const Store = db.store
const Product = db.products
const Manufacturer = db.manufacturer
const Category = db.category
const ProductStock = db.productStock
const User = db.user
// const UserLog = db.userLog
const SalesExecutive = db.salesExecutive
const UserStoreMapping = db.userStoreMapping
const StoreCategoryMapping = db.storeCategoryMapping
const Order = db.order;
const PurchaseOrder = db.purchaseOrder;
const PurchaseOrderItems = db.purchaseOrderItems
const SaleQuotation = db.saleQuotation
const SaleQuotationItem = db.saleQuotationItem
const OrderItems = db.orderItems
const SupplierMaster = db.supplier
const StateMaster = db.stateMaster
const CodeMaster = db.codeMaster
const TaxMaster = db.tax
const CustomerMaster = db.customer
const ProductPrice = db.productPrice
const StockInOut = db.stockInOut
const AutoGenerateNumber = db.autoGenerateNumber
const fs = require('fs')
const path = require('path')
let multer = require('multer');
// const { check } = require('express-validator');
const upload = multer({ dest: 'public/' })
const uploadNew = multer({ dest: 'public/' })
const bulkUpload = multer({ dest: 'public/' })
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const { password } = require('../config/database');

// router.use(userActivity)
// Register User Api

router.get('/register', function (req, res) {
  res.render('register', { title: 'Express' });
});

router.post("/register", userController.registerUser);





// Login User Api

router.get('/', function (req, res) {

  res.render('login', { title: 'Express', message: req.flash('message'), error: req.flash('error') });

});

router.post("/login", userController.loginUser);


// Password reset functionality

router.get('/emailValidate', function (req, res) {

  res.render('resetPassword/emailValidate', { title: 'Express', message: req.flash('message') });

});


// Request for password reset
router.post('/forgot-password', async (req, res) => {

  const { email } = req.body;

  // Check if the email exists in the database
  const user = await User.findOne({ where: { email } });

  if (!user) {
    req.flash('message', "There is no user linked with this Email please use only correct Email")
    return res.redirect('/emailValidate');
  }

  // Generate and store a unique token in the database
  const resetToken = bcrypt.hashSync(email, 10); // You may want to use a more secure method
  user.resetToken = resetToken;
  await user.save();

  // Send password reset email
  const transporter = nodemailer.createTransport({
    host: 'az1-ts112.a2hosting.com',
    port: 465,
    secure: true,
    auth: {
      user: "sumit@scaleedge.in",
      pass: "sumitQWE123!@"
    }
  });


  const mailOptions = {
    from: "sumit@scaleedge.in",
    to: email,
    subject: 'Password Reset',
    html: `<p>Click <a href="https://ims.scaleedge.in/reset-password/${resetToken}">here</a> to reset your password.</p>`,
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      req.flash('message', "Email not send")
      return res.redirect('/emailValidate');
    }

    console.log({
      status: 200,
      message: "Email send successfully",
      info: info.response
    })
    req.flash('message', 'Password reset link sent successfully on your Email')
    return res.redirect('/')
  });
});


// Render the password reset form
router.get('/reset-password/:token', async (req, res) => {
  console.log(123456)
  const resetToken = req.params.token;

  // Check if the token exists in the database
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    return res.render('reset-password', { error: 'Invalid or expired token' });
  }

  // Render the password reset form with the token
  return res.render('resetPassword/changePassword', { title: 'Express', message: req.flash('message'), token: resetToken });
});


// Handle the password reset form submission
router.post('/reset-password/:token', async (req, res) => {
  const resetToken = req.params.token;
  const newPassword = req.body.password;
  const confirmPassword = req.body.confirmPassword

  if (newPassword !== confirmPassword) {
    req.flash('message', "Password and confirm password does not matched")
    return res.redirect(`/reset-password/${resetToken}`);
  }

  // Check if the token exists in the database
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    req.flash('message', "User Not found")
    return res.redirect(`/reset-password/${resetToken}`);
  }

  // Update the user's password with the new password
  const hashedPassword = bcrypt.hashSync(newPassword, 10); // You may want to use a more secure method
  user.password = hashedPassword;
  user.resetToken = null; // Clear the reset token after password update
  await user.save();

  // Render a success message or redirect to the login page
  req.flash('message', 'Password reset successfully')
  return res.redirect('/')
});


// logout Api

router.get('/logout', function (req, res) {
  req.session.isLoggedIn = false
  req.flash('message', 'You are Successfully Logout.');
  res.redirect('/');
});



// Dashboard Api

router.get('/dashboard', checkUser, async function (req, res) {
  function capitalizeEachWord(name) {
    // Split the name into an array of words
    const nameArray = name.split(' ');

    // Capitalize the first letter of each word
    const capitalizedWords = nameArray.map(word => word.charAt(0).toUpperCase() + word.slice(1));

    // Join the words back into a single string
    const capitalizedName = capitalizedWords.join(' ');

    return capitalizedName;
}
  const userDetails = await User.findOne({ where: { id: req.session.userDetail.id } })
  const userName = capitalizeEachWord(userDetails.firstName + ' ' + userDetails.lastName)
  const store = await Store.count()
  const products = await NewProduct.count()
  const supplier = await SupplierMaster.count()
  const customer = await CustomerMaster.count()
  const user = await User.count()
  const orders = await Order.count()
  const order = await Order.findOne({
    order: [['createdAt', 'DESC']]
  });
  res.render('dashboard', { title: 'Express', message: req.flash('message'), user,orders,order, userName,store,products,supplier,customer });
});


router.get('/profile', checkUser, async function (req, res) {
  const user = await User.findOne({ where: { id: req.session.userDetail.id } })
  let userName = user.firstName + ' ' + user.lastName

  function capitalizeEachWord(name) {
    // Split the name into an array of words
    const nameArray = name.split(' ');

    // Capitalize the first letter of each word
    const capitalizedWords = nameArray.map(word => word.charAt(0).toUpperCase() + word.slice(1));

    // Join the words back into a single string
    const capitalizedName = capitalizedWords.join(' ');

    return capitalizedName;
}
const userNameCapital = capitalizeEachWord(userName)
const userRole = capitalizeEachWord(user.role)
  res.render('profile', { title: 'Express', message: req.flash('message'), user, userNameCapital,userRole });
});


// Create User Api

router.get('/user', checkUser, async function (req, res) {
  const user = await User.findAll()
  res.render('user/user', { title: 'Express', message: req.flash('message'), user });
});

router.get('/getManagers/:role', async (req, res) => {
  const role = req.params.role;
  const managers = await User.findAll({ where: { role: role } });
  const filteredManagers = managers.map((manager) => ({
    id: manager.id,
    email: manager.email,
  }))
  res.json(filteredManagers);
});

router.get('/getAllStores', async (req, res) => {
  const stores = await Store.findAll({ where: { status: 'Active' } })
  res.json(stores);
});

router.post('/createUser', userController.createUser)




// Update User Api

router.get('/getSelectedManagerStores/:managerId/:userId', userStoreMapping.getManagerStore)

router.get('/userUpdate/:id', checkUser, async function (req, res) {

  const user = await User.findOne({ where: { id: req.params.id } })

  const previousManager = await User.findOne({ where: { id: user.managerFk } })

  // for edit mode get all users
  const allUsers = await User.findAll()
  res.render('user/userUpdate', { title: 'Express', message: req.flash('message'), user, editMode: true, allUsers, previousManager });
});

router.get('/getAllStoresForRole/:role', async (req, res) => {
  const stores = await Store.findAll({ where: { status: 'Active' } })
  res.json(stores);
});

router.post('/updateUser/:id', userController.updateUser)


// User Listing Api

router.get('/userList', checkUser, function (req, res) {
  const role = req.session.userDetail.role
  if (role == 'super admin') {
    return res.render('user/userList', { title: 'Express', message: req.flash('message') });
  }
  req.flash('message', 'You can not access this page only super admin can do this')
  return res.redirect('/')
});


router.get('/userMasterList', async function (req, res) {


  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    where[Op.or] = [
      { id: { [Op.like]: `%${req.query.search.value}%` } },
      { firstname: { [Op.like]: `%${req.query.search.value}%` } },
      { lastname: { [Op.like]: `%${req.query.search.value}%` } },
      { email: { [Op.like]: `%${req.query.search.value}%` } },
      { mobileNumber: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const user = await User.findAll({
    limit: length,
    offset: start,
    where: { ...where, isDeleted: '0' },
  })
  const count = await User.count()

  let data_arr = []
  for (let i = 0; i < user.length; i++) {
    data_arr.push({
      'id': user[i].id,
      'firstName': user[i].firstName,
      'lastName': user[i].lastName,
      'role': user[i].role,
      'email': user[i].email,
      'password': user[i].password,
      'mobileNumber': user[i].mobileNumber
    });
  }
  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };
  res.json(output)
})

//user delete 

router.post('/userDelete/:id', async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.id } })
  await User.update({ isDeleted: '1' }, { where: { id: req.params.id } })
  return res.json(true)
})





// User Store Mapping Api

router.get('/userStoreMapping', async function (req, res) {
  const user = await User.findAll();
  const store = await Store.findAll()
  res.render('userStoreMapping', { title: 'Express', message: req.flash('message'), user, store });
});

router.get('/getSelectedStores/:userId', userStoreMapping.getUserStoreData)


//  router.post('/createUser', userStoreMapping.addUserStoreMapping)

router.post('/deselectStore/:userId/:outletId', userStoreMapping.deselectStore)


// Store Category Mapping

router.get('/storeCategoryMapping', async function (req, res) {
  const store = await Store.findAll();
  const category = await Category.findAll({ where: { approve_b: 'approved' } })
  res.render('storeCategoryMapping', { title: 'Express', message: req.flash('message'), category, store });
});

router.post('/storeCategoryMapping', storeCategoryMapping.addStoreCategoryMapping)

router.get('/getSelectedCategories/:outletId', storeCategoryMapping.getStoreCategoryData)
//done
//done2
router.post('/deselectCategory/:outletId/:categoryId', storeCategoryMapping.deselectCategories)


// Create Product Api

router.get('/product', checkUser, async function (req, res) {
  const manufacturer = await Manufacturer.findAll({ where: { approve_b: 'approved' } })
  res.render('product/product', { title: 'Express', message: req.flash('message'), manufacturer });
});


// Endpoint to check code uniqueness
router.get('/checkProductCodeIsUnique/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const count = await NewProduct.count({
      where: {
        itemCode: code,
      },
    });
    const isUnique = count === 0;
    res.json({ isUnique });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking code uniqueness' });
  }
});


router.get('/newProduct', checkUser, async function (req, res) {
  const category = await CodeMaster.findAll({ where: { code_level: 1, Active: 'Active' } });
  const manufacturer = await Manufacturer.findAll()
  const tax = await TaxMaster.findAll({ where: { Status: 'Active' } })
  res.render('product/newProduct', { title: 'Express', message: req.flash('message'), category, manufacturer, tax });
});

router.get('/departments/:categoryId', async (req, res) => {
  const { categoryId } = req.params;
  const departments = await CodeMaster.findAll({ where: { code_level: 2, ParentPk: categoryId, Active: 'Active' } });
  res.json(departments);
});

router.get('/groups/:departmentId', async (req, res) => {
  const { departmentId } = req.params;
  const groups = await CodeMaster.findAll({ where: { code_level: 3, ParentPk: departmentId, Active: 'Active' } });
  res.json(groups);
});

router.get('/itemTypes/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const itemTypes = await CodeMaster.findAll({ where: { code_level: 4, ParentPk: groupId, Active: 'Active' } });
  res.json(itemTypes);
});

// Define a route to delete an image from new product page
router.post('/deleteImageWithoutItemId/:image', async (req, res) => {
  try {
    const image = req.params.image;

    // Get the absolute path of the project
    const projectPath = path.resolve(__dirname, '..'); // Assuming your route file is in the 'routes' directory
    // Construct the correct image path
    const imagePath = path.join(projectPath, 'public', 'uploads', image);
    fs.unlinkSync(imagePath)
    res.json({ success: true });
  } catch (err) {
    console.log(err)
    res.json({ success: false });
  }
});

router.post('/createProduct', upload.single('imageUrl'), productController.createProduct)


router.post('/createNewProduct', upload.single('imageUrl'), productController.createNewProduct)


// Product Deatail Listing Api

router.get('/productDetailsList', checkUser, async function (req, res) {
  res.render('product/productDetailsList', { title: 'Express', message: req.flash('message') });
});

router.get('/productsDetailsList', checkUser, async function (req, res) {
  let draw = req.query.draw;
  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (req.query.search.value) {
    where[Op.or] = [
      { '$product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
      { Cat1: { [Op.like]: `%${req.query.search.value}%` } },
      { Cat2: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const productStock = await ProductStock.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"]
    },
    include: [
      {
        model: Product,
        // attributes:['itemName']
      },
      {
        model: Store,
        // attributes:['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await ProductStock.count();

  let data_arr = [];
  for (let i = 0; i < productStock.length; i++) {
    data_arr.push({
      itemName: productStock[i].product.itemName,
      storeName: productStock[i].store_master.storeName,
      stock: productStock[i].stock,
      salePrice: productStock[i].salePrice,
      mrp: productStock[i].mrp,
      Cat1: productStock[i].Cat1,
      Cat2: productStock[i].Cat2,
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});




// Product Master Listing Api

router.get('/productMasterList', checkUser, async function (req, res) {
  res.render('product/productMasterList', { title: 'Express', message: req.flash('message') });
});

router.get('/productsMasterList', checkUser, async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { itemName: { [Op.like]: `%${req.query.search.value}%` } },
      { description: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const product = await Product.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"]
    },
    limit: length,
    offset: start
  });

  const count = await Product.count()


  let data_arr = []
  for (let i = 0; i < product.length; i++) {
    data_arr.push({
      'itemId': product[i].itemId,
      'itemName': product[i].itemName,
      'description': product[i].description,
      'imageUrl': product[i].imageUrl,
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});

router.get('/newProductList', checkUser, async function (req, res) {
  res.render('product/newProductList', { title: 'Express', message: req.flash('message') });
});

router.get('/newProductsList', async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { itemCode: { [Op.like]: `%${req.query.search.value}%` } },
      { itemName: { [Op.like]: `%${req.query.search.value}%` } },
      { description: { [Op.like]: `%${req.query.search.value}%` } },
      { status: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const product = await NewProduct.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"],
      isDeleted: '0'
    },
    limit: length,
    offset: start
  });

  const count = await NewProduct.count({ where: { isDeleted: '0' } })


  let data_arr = []
  for (let i = 0; i < product.length; i++) {
    data_arr.push({
      'itemCode': product[i].itemCode,
      'itemId': product[i].itemId,
      'itemName': product[i].itemName,
      'description': product[i].description,
      'imageUrl': product[i].imageUrl,
      'status': product[i].status,
      'rowguid': product[i].rowguid,
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});


// Product Update Api

router.get('/updateProduct/:id', checkUser, async function (req, res) {

  const product = await Product.findOne({ where: { itemId: req.params.id } })

  const manufacturer = await Manufacturer.findAll({ where: { approve_b: 'approved' } })

  res.render('product/productUpdate', { title: 'Express', message: req.flash('message'), manufacturer, product });
});

router.post('/updateProduct/:id', upload.single('imageUrl'), productController.updateProduct)


router.get('/updateNewProduct/:id', checkUser, async function (req, res) {

  const product = await NewProduct.findOne({ where: { rowguid: req.params.id } })
  const category = await CodeMaster.findAll({ where: { code_level: 1, Active: 'Active' } })
  const categoryPreviousValue = await CodeMaster.findOne({ where: { id: product.category } })
  // const department = await CodeMaster.findAll({where : {code_level : 2, ParentPk :2}})
  const departmentPreviousValue = await CodeMaster.findOne({ where: { id: product.department } })
  // const group = await CodeMaster.findAll({where : {code_level : 3}})
  const groupPreviousValue = await CodeMaster.findOne({ where: { id: product.group } })
  // const itemType = await CodeMaster.findAll({where : {code_level : 4}})
  const itemTypePreviousValue = await CodeMaster.findOne({ where: { id: product.itemType } })
  const manufacturer = await Manufacturer.findAll({ where: { approve_b: 'approved' } })
  const manufacturerPreviousValue = await Manufacturer.findOne({ where: { manufacturerId: product.brand } })
  const tax = await TaxMaster.findAll({ where: { Status: 'Active' } })
  const taxPreviousValue = await TaxMaster.findOne({ where: { id: product.tax } })
  res.render('product/newProductUpdate', { title: 'Express', message: req.flash('message'), manufacturer, product, category, tax, categoryPreviousValue, departmentPreviousValue, groupPreviousValue, itemTypePreviousValue, manufacturerPreviousValue, taxPreviousValue });
});


router.get('/getProductImages/:id', async function (req, res) {
  const itemId = req.params.id
  const allImageUrls = await ProductImage.findAll({ where: { itemId: itemId } })
  res.json(allImageUrls)
})

// Define a route to delete an image in update new product page
router.post('/deleteImage/:image/:itemId', async (req, res) => {
  try {
    const image = req.params.image;
    const itemId = req.params.itemId

    const deletedRows = await ProductImage.destroy({
      where: { imageUrl: image, itemId: itemId },
    });

    // Get the absolute path of the project
    const projectPath = path.resolve(__dirname, '..'); // Assuming your route file is in the 'routes' directory

    // Construct the correct image path
    const imagePath = path.join(projectPath, 'public', 'uploads', image);

    fs.unlinkSync(imagePath)

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
});


router.post('/newProductUpdate/:id', upload.array('imageUrl', 5), productController.updateNewProduct)

//product delete 

router.post('/deleteProduct/:id', async (req, res) => {
  const product = await NewProduct.findOne({ where: { rowguid: req.params.id } })
  await product.update({ isDeleted: '1' })
  return res.json(true)
});

// Product Stock Api

router.post('/addProductStock', productStockController.addProductStock)



// Product Category Mapping

router.get('/productCategoryMapping', checkUser, async function (req, res) {
  const store = await Store.findAll({ where: { approve_b: 'approved' } })
  const product = await Product.findAll({ where: { approve_b: 'approved' } })
  const category = await Category.findAll({ where: { approve_b: 'approved' } })
  res.render('productCategoryMapping', { title: 'Express', message: req.flash('message'), store, product, category });
});

router.post('/productCategoryMapping', productCategoryMapping.productCategoryMapping)





// Store Master Api

router.get('/storeMaster', checkUser, function (req, res) {
  res.render('store/storeMaster', { title: 'Express', message: req.flash('message') });
});

// Endpoint to check code uniqueness
router.get('/checkStoreCodeIsUnique/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const count = await Store.count({
      where: {
        Code: code,
      },
    });
    const isUnique = count === 0;
    res.json({ isUnique });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking code uniqueness' });
  }
});

router.get('/newStore', checkUser, async function (req, res) {
  const category = await CodeMaster.findAll({ where: { code_level: 1, Active: 'Active' } })
  const state = await StateMaster.findAll({ where: { status: 'Active' } })
  res.render('store/newStore', { title: 'Express', message: req.flash('message'), category, state });
});

router.post("/createNewStore", storeController.createNewStore);

//store delete 

router.post('/deleteStore/:id', async (req, res) => {
  const store = await Store.findOne({ where: { rowguid: req.params.id } })
  await store.update({ isDeleted: '1' })
  return res.json(true)
});


// Store List Api

router.get('/storeList', checkUser, async function (req, res) {
  const role = req.session.userDetail.role
  if (role == 'super admin') {
    return res.render('store/storeMasterList', { title: 'Express', message: req.flash('message') });
  }
  req.flash('message', 'You can not access this page only super admin can do this')
  return res.redirect('/')
})

router.get('/storemasterList', async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    where[Op.or] = [
      { storeName: { [Op.like]: `%${req.query.search.value}%` } },
      { storeAddress: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }
  const store = await Store.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"]
    },
    limit: length,
    offset: start
  });

  const count = await Store.count()

  let data_arr = []
  for (let i = 0; i < store.length; i++) {
    data_arr.push({
      'outletId': store[i].outletId,
      'storeName': store[i].storeName,
      'storeAddress': store[i].storeAddress
    });
  }
  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };
  res.json(output)
})

router.get('/newStoreList', checkUser, async function (req, res) {
  res.render('store/newStoreList', { title: 'Express', message: req.flash('message') });
})

router.get('/newStoremasterList', async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    where[Op.or] = [
      { code: { [Op.like]: `%${req.query.search.value}%` } },
      { storeName: { [Op.like]: `%${req.query.search.value}%` } },
      { businessType: { [Op.like]: `%${req.query.search.value}%` } },
      { address1: { [Op.like]: `%${req.query.search.value}%` } },
      { contactPersonName: { [Op.like]: `%${req.query.search.value}%` } },
      { contactNo1: { [Op.like]: `%${req.query.search.value}%` } },
      { status: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }
  const store = await Store.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"],
      isDeleted: '0'
    },
    limit: length,
    offset: start
  });

  const count = await Store.count({ where: { isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < store.length; i++) {
    data_arr.push({
      'code': store[i].code,
      'storeName': store[i].storeName,
      'businessType': store[i].businessType,
      'address1': store[i].address1,
      'contactPersonName': store[i].contactPersonName,
      'contactNo1': store[i].contactNo1,
      'status': store[i].status,
      'rowguid': store[i].rowguid
    });
  }
  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };
  res.json(output)
})


// Update Store Master Api

router.get('/updateStoreMaster/:id', checkUser, async function (req, res) {

  let store = await Store.findOne({ where: { outletId: req.params.id } })

  res.render('store/storeMasterUpdate', { title: 'Express', message: req.flash('message'), store });
});

// router.post("/updateStore/:id", storeController.updateStore);


router.get('/updateNewStore/:id', checkUser, async function (req, res) {

  let newStore = await Store.findOne({ where: { rowguid: req.params.id } })

  const state = await StateMaster.findAll({ where: { status: "Active" } })

  res.render('store/newStoreUpdate', { title: 'Express', message: req.flash('message'), newStore, state });
});

router.post("/updateNewStore/:id", storeController.updateNewStore);



// Product Rate Api 

router.get('/productRaise', checkUser, async function (req, res) {

  const store = await Store.findAll({ where: { approve_b: 'approved' } })

  const product = await Product.findAll({ where: { approve_b: 'approved' } })

  res.render('productRaise/productRaise', { title: 'Express', message: req.flash('message'), store, product });
});

router.post('/productRaise', productRaise.addProductRaise)


// Update Product Rate Api 

router.get('/updateProductRaise/:id', checkUser, async function (req, res) {

  const store = await Store.findAll({ where: { approve_b: 'approved' } })

  const product = await Product.findAll({ where: { approve_b: 'approved' } })

  const productStock = await ProductStock.findOne({ where: { itemId: req.params.id } })

  res.render('productRaise/productRaiseUpdate', { title: 'Express', message: req.flash('message'), store, product, productStock });
});

router.post('/productRaise', productRaise.updateProductRaise)



// Stock In/Out Api

//refference number generator
router.get("/stockReffernceNum", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "PURCHASE", suffix: "INVOICE" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})


//refference number generator
router.get("/openingStockEntryInvoiceNumber", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "OPENSTE" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

//refference number generator
router.get("/productDamageInvoiceNumber", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "PRODDMG" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

//refference number generator
router.get("/supplierMasterCode", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "SUPL" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

//refference number generator
router.get("/customerMasterCode", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "CUST" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

//refference number generator
router.get("/taxxMasterCode", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "TAX" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

router.get("/storeCode", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "STO" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

router.get("/productCode", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "PROD" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})


router.get("/stockOutInvoiceNumber", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "INV" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})






// Route to update the lastno value
router.post('/updateLastNo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lastNo } = req.body;

    // return console.log(4555,id,lastNo)

    // Update the lastno value in the database
    const updatedRefNum = await AutoGenerateNumber.update(
      { lastNo },
      { where: { id } }
    );

    if (updatedRefNum[0] === 1) {
      res.status(200).json({ message: 'Lastno updated successfully' });
    } else {
      res.status(404).json({ error: 'Record not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Invoice number for stockout



router.get('/stockInOut', checkUser, async function (req, res) {
  const store = await Store.findAll({ where: { approve_b: 'approved' } })
  const product = await Product.findAll({ where: { approve_b: 'approved' } })
  res.render('stockInOut', { title: 'Express', message: req.flash('message'), store, product });
});

router.post('/stockInOut', stockInOutController.stockInOut)




// Stock In Api

router.get('/stockIn', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active', approve_b: 'approved' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('stockInOut/stockIn', { title: 'Express', message: req.flash('message'), store, product });
});

// store wise all supplier populate into supplier dropdown
router.get('/suppliers/:outletId', async function (req, res) {
  const outletId = req.params.outletId
  const suppliers = await SupplierMaster.findAll({ where: { storeFk: outletId, Status: 'Active' } })
  res.json(suppliers)
})

// populate the supplier detail into stock In
router.get('/allSuppliers/:supplierId', async function (req, res) {
  const supplierId = req.params.supplierId
  const suppliers = await SupplierMaster.findAll({ where: { id: supplierId } })
  res.json(suppliers)
})

// product wise  hsn code populate into hsn input
router.get('/getHsnCode/:itemId', async function (req, res) {
  const itemId = req.params.itemId
  const hsnCode = await NewProduct.findOne({ where: { itemId: itemId } })
  res.json(hsnCode)
})

// product wise  taxPercentage populate into tax percentage input
router.get('/getTaxPercentage/:itemId', async function (req, res) {
  const itemId = req.params.itemId
  const product = await NewProduct.findOne({ where: { itemId: itemId } })
  const taxPercentage = await TaxMaster.findOne({ where: { id: product.tax } })
  res.json(taxPercentage)
})

// stock In post api
router.post('/createStockIn', stockInOutController.addStockIn)


// Stock In  Approval List

router.get('/stockInApprovalList', checkUser, stockInOutController.stockInApprovalList);

router.post('/updateStockInApprovalStatus', checkUser, stockInOutController.updateStockInApprovalStatus)



// stock In list Order wise

router.get('/stockInList', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })

  res.render('purchaseInvoice/stockInList', { title: 'Express', store, message: req.flash('message') });
});

router.get('/stockInListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  console.log(444, outletId)

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'In',
      orderType: 'order',
      isDeleted: '0'
    },
    include: [
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { stockType: 'In', orderType: 'order', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      rowguid: order[i].rowguid,
      approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});


// stock In update module

router.get('/stockInUpdate/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId, status: 'Active' } })
  const previousSupplier = await SupplierMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('purchaseInvoice/updateStockIn', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousSupplier, store, product });
});

// stcok in update delete row data
router.post('/deleteRowDataStockIn/:itemId/:batchNo/:orderId', async function (req, res) {
  await ProductPrice.destroy({ where: { itemId: req.params.itemId, batchNO: req.params.batchNo, stockType: 'In', orderFk: req.params.orderId } })
});

// only view data in stock in order
router.get('/stockInView/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousSupplier = await SupplierMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores } })
  const purchaseOrderNo = await PurchaseOrder.findOne({ where: { orderId: order.purchaseOrderFk } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('purchaseInvoice/purchaseInvoiceView', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousSupplier, store, product, purchaseOrderNo });
});

// populate the multiplae product details into stockInUpdate module
router.get('/existingProductDetails/:productId', async function (req, res) {
  const itemId = req.params.productId
  const products = await ProductPrice.findAll({ where: { orderFk: itemId } })
  res.json(products)
})



// existing productName in stokInUpdate module
router.get('/existingProductName/:productId', async function (req, res) {
  const itemId = req.params.productId
  const products = await NewProduct.findOne({ where: { itemId: itemId } })
  res.json(products)
})

// router.post('/updateStockIn/:id', stockInOutController.updateStockIn)
router.post('/updateStockIn/:id', stockInOutController.updateStockIn)


//stockIn delete 

router.post('/deleteStockIn/:id', async (req, res) => {
  const order = await Order.findOne({ where: { rowguid: req.params.id } })
  await order.update({ isDeleted: '1' })
  return res.json(true)
});

// Stock Out module

router.get('/stockOut', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // const product = await NewProduct.findAll()
  const customer = await CustomerMaster.findAll({ where: { Status: 'Active' } })
  const saleExecutive = await SalesExecutive.findAll({ where: { status: "Active", storeFk: userStores } })
  res.render('salesInvoice/stockOut', { title: 'Express', message: req.flash('message'), store, customer, saleExecutive });
});

// Get Tax percentage from product table
router.get("/getTaxPercentage/:itemId", async function (req, res) {
  console.log(123456)
  const tax = await NewProduct.findOne({ where: { itemId: req.params.itemId } })
  const taxPercentage = await TaxMaster.findOne({ where: { id: tax.id } })
  console.log(taxPercentage.Tax_percentage)
  res.json(taxPercentage)
})

// Quantity of stock from stock ledger
router.get('/getStockQuantity/:itemId/:batchNo', async (req, res) => {
  console.log(123456789)
  const itemId = req.params.itemId;
  const batchNO = req.params.batchNo;

  try {
    // Assuming you have a StockInOut model with your database schema
    const stockInQty = await StockInOut.sum('qty', {
      where: {
        itemId: itemId,
        batchNO: batchNO,
        type: 'In',
      },
    });

    const stockOutQty = await StockInOut.sum('qty', {
      where: {
        itemId: itemId,
        batchNO: batchNO,
        type: 'Out',
      },
    });

    const stockQuantity = (stockInQty || 0) - (stockOutQty || 0);

    res.json({
      stockIn: stockInQty || 0, // Ensure that 0 is returned when no records match the condition 
      stockOut: stockOutQty || 0,
      stockQuantity: stockQuantity,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Stock Out Post Api

router.post('/createStockOut', stockInOutController.addStockOut);

// Stock Out Approval List

router.get('/stockOutApprovalList', checkUser, stockInOutController.stockOutApprovalList);

router.post('/updateStockOutApprovalStatus', checkUser, stockInOutController.updateStockOutApprovalStatus)


// stock Out Listing Module

router.get('/stockOutList', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  res.render('salesInvoice/stockOutList', { title: 'Express', store, message: req.flash('message') });
});

router.get('/stockOutListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'Out',
      orderType: 'order',
      isDeleted: '0'
    },
    include: [
      //   // {
      //   //   model: NewProduct,
      //   //    attributes:['itemName']
      //   // },
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { stockType: 'Out', orderType: 'order', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      rowguid: order[i].rowguid,
      approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});


// populate the customer details into stockOut module
router.get('/allCustomer/:customerId', async function (req, res) {
  const customerId = req.params.customerId
  const customers = await CustomerMaster.findAll({ where: { id: customerId } })
  res.json(customers)
})

//populate store based all products in stock out
router.get('/products/:outletId', async function (req, res) {
  const allProducts = await StockInOut.findAll({ where: { outletId: req.params.outletId } })
  let products = []
  products = allProducts.map(mapping => mapping.itemId)
  allStoreProducts = await NewProduct.findAll({ where: { itemId: products, approve_b: 'approved' } })
  res.json(allStoreProducts)
})

// batchNO based all products selected for stockLedger
router.get('/allBatchNo/:itemId/:outletId', async function (req, res) {
  const itemId = req.params.itemId
  const outletId = req.params.outletId
  const allBatchNo = await StockInOut.findAll({ where: { outletId: outletId, itemId: itemId, type: 'In' } })
  // console.log(allBatchNo)
  res.json(allBatchNo)
})


// populate the product details into stockOut module
router.get('/getProductDetails/:itemId/:batchNo', async function (req, res) {
  //console.log(55588,req.params.itemId,req.params.batchNo)
  const productDetails = await ProductPrice.findAll({ where: { itemId: req.params.itemId, batchNo: req.params.batchNo } })

  res.json(productDetails)
})

// stock Out update module

router.get('/stockOutUpdate/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousCustomer = await CustomerMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('salesInvoice/updateStockOut', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousCustomer, store, product });
});

// stcok Out update delete row data
router.post('/deleteRowDataStockOut/:itemId/:batchNo/:orderId', async function (req, res) {
  await ProductPrice.destroy({ where: { itemId: req.params.itemId, batchNO: req.params.batchNo, stockType: 'Out', orderFk: req.params.orderId } })
});

// stock out update post request

router.post('/updateStockOut/:id', stockInOutController.updateStockOut);

//stockOut delete 

router.post('/deleteSalesOrder/:id', async (req, res) => {
  const order = await Order.findOne({ where: { rowguid: req.params.id } })
  await order.update({ isDeleted: '1' })
  return res.json(true)
});


// stock Out view module

router.get('/stockOutView/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousCustomer = await CustomerMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('salesInvoice/stockOutView', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousCustomer, store, product });
});






// Opening Stock In Module

router.get('/openingStockEntryIn', async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  res.render('stockInOut/openingStockEntry', { title: 'Express', message: req.flash('message'), store, product });
});

router.post('/createOpeningStockEntryIn', stockInOutController.openingStockEntryIn)


// Opening Stock Entry Approval List

router.get('/openingStockEntryApprovalList', checkUser, stockInOutController.openingStockEntryApprovalList);

router.post('/updateOpeningStockEntryApprovalStatus', stockInOutController.updateOpeningStockEntryApprovalStatus)

// Opening Stock list Order wise

router.get('/openingStockList', checkUser, async function (req, res) {
  res.render('stockInOut/openingStockList', { title: 'Express', message: req.flash('message') });
});

router.get('/openingStockListData', async function (req, res) {
  let draw = req.query.draw
  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where,
      orderType: 'openingStock',
      isDeleted: '0',
      outletId: userStores
    },
    include: [
      //   // {
      //   //   model: NewProduct,
      //   //    attributes:['itemName']
      //   // },
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { orderType: 'openingStock', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      orderId: order[i].orderId,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      rowguid: order[i].rowguid,
      approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});


// Opening Stock update module

router.get('/openingStockEntryUpdate/:id', async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId, status: 'Active' } })
  const previousSupplier = await SupplierMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('stockInOut/updateOpeningStockEntry', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousSupplier, store, product });
});

router.post('/updateOpeningStockEntry/:id', stockInOutController.updateOpeningStockEntryIn)

//openingStock delete 

router.post('/deleteOpeningStock/:id', async (req, res) => {
  const order = await Order.findOne({ where: { rowguid: req.params.id } })
  await order.update({ isDeleted: '1' })
  return res.json(true)
});

// opening stock view
router.get('/openingStockView/:id', async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId, status: 'Active' } })
  const previousSupplier = await SupplierMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('stockInOut/openingStockEntryView', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousSupplier, store, product });
});




// Product Damage Entry Module

router.get('/productDamageEntryOut', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // const product = await NewProduct.findAll()
  const customer = await CustomerMaster.findAll({ where: { Status: 'Active' } })
  res.render('stockInOut/productDamage', { title: 'Express', message: req.flash('message'), store, customer });
});

router.post('/createProductDamage', stockInOutController.productDamageEntryOut)


// Product Damage Entry Approval List

router.get('/productDamageEntryApprovalList', checkUser, stockInOutController.productDamageEntryApprovalList);

router.post('/updateProductDamageEntryApprovalStatus', stockInOutController.updateProductDamageEntryApprovalStatus)



// Product Damage list 

router.get('/productDamageList', checkUser, async function (req, res) {
  res.render('stockInOut/productDamageList', { title: 'Express', message: req.flash('message') });
});

router.get('/productDamageListData', async function (req, res) {
  let draw = req.query.draw
  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where,
      orderType: 'damage',
      isDeleted: '0',
      outletId: userStores
    },
    include: [
      //   // {
      //   //   model: NewProduct,
      //   //    attributes:['itemName']
      //   // },
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { orderType: 'damage', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      orderId: order[i].orderId,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      rowguid: order[i].rowguid,
      approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});



// product damage update module

router.get('/productDamageEntryUpdate/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousCustomer = await CustomerMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('stockInOut/updateProductDamage', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousCustomer, store, product });
});


// Product damage view

router.get('/productDamageView/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousCustomer = await CustomerMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('stockInOut/productDamageView', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousCustomer, store, product });
});




// product damage update post request

router.post('/updateproductDamageEntry/:id', stockInOutController.updateproductDamageEntry);


//productDamage delete 

router.post('/deleteProductDamage/:id', async (req, res) => {
  const order = await Order.findOne({ where: { rowguid: req.params.id } })
  await order.update({ isDeleted: '1' })
  return res.json(true)
});




// Manufacturer Master Api

router.get('/manufacturer', checkUser, function (req, res) {
  res.render('manufacturer/manufacturer', { title: 'Express', message: req.flash('message') });
});

router.post('/addManufacturer', manufacturerController.addManufacturer)


// Manufacturer approval Api

router.get('/admin/manufacturer/approvalList', manufacturerController.adminView)

router.post('/admin/approval/:manufacturerId', manufacturerController.adminApprove)



// Manufacturer Listing Api

router.get('/manufacturerList', checkUser, function (req, res) {
  res.render('manufacturer/manufacturerList', { title: 'Express', message: req.flash('message') });
});

router.get('/manufacturerMasterList', async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    where[Op.or] = [
      { shortDescription: { [Op.like]: `%${req.query.search.value}%` } },
      { longDescription: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const manufacturer = await Manufacturer.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"],
      isDeleted: '0'
    },
    limit: length,
    offset: start
  });

  const count = await Manufacturer.count({ where: { isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < manufacturer.length; i++) {
    data_arr.push({
      'manufacturerId': manufacturer[i].manufacturerId,
      'shortDescription': manufacturer[i].shortDescription,
      'longDescription': manufacturer[i].longDescription
    });
  }
  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
})



// Update Manufacturer Master Api

router.get('/updateManufacturer/:id', checkUser, async function (req, res) {
  const manufacturer = await Manufacturer.findOne({ where: { manufacturerId: req.params.id } })
  res.render('manufacturer/manufacturerUpdate', { title: 'Express', message: req.flash('message'), manufacturer });
});

router.post('/updateManufacturer/:id', manufacturerController.updateManufacturer)

//manufacturer delete 

router.post('/deleteManufacturer/:id', async (req, res) => {
  const manufacturer = await Manufacturer.findOne({ where: { manufacturerId: req.params.id } })
  await manufacturer.update({ isDeleted: '1' })
  return res.json(true)
});

// Category Master Api

router.get('/category', checkUser, function (req, res) {
  res.render('category/category', { title: 'Express', message: req.flash('message') });
});

router.post('/addcategory', categoryController.addCategory)


// Category Listing Api

router.get('/categoryList', checkUser, function (req, res) {
  res.render('category/categoryList', { title: 'Express', message: req.flash('message') });
});

router.get('/categoryMasterList', async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    where[Op.or] = [
      { shortDescription: { [Op.like]: `%${req.query.search.value}%` } },
      { longDescription: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const category = await Category.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"]
    },
    limit: length,
    offset: start
  });
  const count = await Category.count()

  let data_arr = []
  for (let i = 0; i < category.length; i++) {
    data_arr.push({
      'categoryId': category[i].categoryId,
      'shortDescription': category[i].shortDescription,
      'longDescription': category[i].longDescription
    });
  }
  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
})



// Update Category Master Api

router.get('/updateCategory/:id', checkUser, async function (req, res) {

  const category = await Category.findOne({ where: { categoryId: req.params.id } })
  res.render('category/categoryUpdate', { title: 'Express', message: req.flash('message'), category });
});

router.post('/updateCategory/:id', categoryController.updateCategory)



// Category Approval List

router.get('/categoryApprovalList', categoryController.categoryApprovalList);

router.post('/updateCategoryApprovalStatus', categoryController.updateCategoryApprovalStatus)

// Manufacturer Approval List

router.get('/manufacturerApprovalList', manufacturerController.manufacturerApprovalList);

router.post('/updateManufacturerApprovalStatus', manufacturerController.updateManufacturerApprovalStatus)

// Store Approval List

router.get('/storeApprovalList', checkUser, storeController.storeApprovalList);

router.post('/updateStoreApprovalStatus', checkUser, storeController.updateStoreApprovalStatus)

// Product Approval List

router.get('/productApprovalList', checkUser, productController.productApprovalList);

router.post('/updateProductApprovalStatus', checkUser, productController.updateProductApprovalStatus)

// New Product Approval List

router.get('/newProductApprovalList', checkUser, productController.newProductApprovalList);

router.post('/updateNewProductApprovalStatus', checkUser, productController.updateNewProductApprovalStatus)

router.post('/updateApprovalStatusOfProduct', checkUser, productController.updateApprovalStatusOfProduct)


// New Stock In Approval List

router.get('/newStockInApprovalList', checkUser, stockInOutController.newStockInApprovalList);

router.post('/updateNewStockInApprovalStatus', checkUser, stockInOutController.updateNewStockInApprovalStatus)

router.post('/updateApprovalStatusOfStockIn', checkUser, stockInOutController.updateApprovalStatusOfStockIn)

// New Stock In Approval List  

router.get('/newStockOutApprovalList', checkUser, stockInOutController.newStockOutApprovalList);

router.post('/updateNewStockOutApprovalStatus', checkUser, stockInOutController.updateNewStockOutApprovalStatus)

router.post('/updateApprovalStatusOfStockOut', checkUser, stockInOutController.updateApprovalStatusOfStockOut)

// New Opening Stock Approval List

router.get('/newOpeningStockApprovalList', checkUser, stockInOutController.newOpeningStockApprovalList);

router.post('/updateNewOpeningStockApprovalStatus', checkUser, stockInOutController.updateNewOpeningStockApprovalStatus)

router.post('/updateApprovalStatusOfOpeningStock', checkUser, stockInOutController.updateApprovalStatusOfOpeningStock)


// New Product Damage Approval List

router.get('/newProductDamageApprovalList', checkUser, stockInOutController.newProductDamageApprovalList);

router.post('/updateNewProductDamageApprovalStatus', checkUser, stockInOutController.updateNewProductDamageApprovalStatus)

router.post('/updateApprovalStatusOfProductDamage', checkUser, stockInOutController.updateApprovalStatusOfProductDamage)

// Product Category Mapping Approval List

router.get('/proCatMapApprovalList', productCategoryMapping.proCatMapApprovalList);

router.post('/updateProCatMapApprovalStatus', productCategoryMapping.updateProCatMapApprovalStatus)

// Product Rate Approval List

router.get('/productRaiseApprovalList', productRaiseController.productRaiseApprovalList);

router.post('/updateProductRaiseApprovalStatus', productRaiseController.updateProductRaiseApprovalStatus)


// Stock In/Out Approval List

router.get('/stockInOutApprovalList', stockInOutController.stockInOutApprovalList);

router.post('/updateStockInOutApprovalStatus', stockInOutController.updateStockInOutApprovalStatus)

// User Store Management Approval List

router.get('/userStoreMappingApprovalList', userStoreMapping.userStoreMappingApprovalList);

router.post('/updateUserStoreMappingApprovalStatus', userStoreMapping.updateUserStoreMappingApprovalStatus)


// Order Billing Api

router.get('/order', async function (req, res) {
  //  const userId = req.session.userDetail.id
  // const userStoreMapping = await UserStoreMapping.findAll({where : {userFk : userId}})
  // let userStores = []
  // userStores = userStoreMapping.map(mapping => mapping.storeFk)
  //   const store = await Store.findAll({where : {outletId : userStores}})

  const store = await Store.findAll()
  const product = await Product.findAll()
  const productStock = await ProductStock.findAll()
  res.render('order/order', { title: 'Express', message: req.flash('message'), store, product, productStock });
});

router.post('/order', orderController.createOrderBill)


//order listing

router.get('/orderList', async function (req, res) {
  res.render('order/orderList', { title: 'Express', message: req.flash('message') });
});


router.get('/orderDetailsList', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { orderId: { [Op.like]: `%${req.query.search.value}%` } },
      { customerName: { [Op.like]: `%${req.query.search.value}%` } },
      { totalAmount: { [Op.like]: `%${req.query.search.value}%` } },
      { createdAt: { [Op.like]: `%${req.query.search.value}%` } },
      { '$order_item.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({

    include: [
      {
        model: OrderItems,
        // as: 'order_item' // Add this line to define the alias
      },
    ],
    limit: length,
    offset: start,
    where: where
  })

  // console.log(77777777777,order.orderId)
  // const  customerOrderId=order.orderId

  // const outletIdByOrderid = await ProductPrice.findAll({
  //   where: { orderFk: customerOrderId },
  //   attributes: ['outletId']
  // });

  // const storeName=await Store.findOne({where:{outletId}})



  const count = await Order.count()

  let data_arr = []
  for (let i = 0; i < order.length; i++) {

    // Format the createdAt date to display only the date portion

    let formattedDate = order[i].createdAt.toLocaleDateString();

    data_arr.push({
      'orderId': order[i].orderId,
      'customerName': order[i].customerName,
      'storeName': order[i].order_item.storeName,
      'totalAmount': order[i].totalAmount,
      'createdAt': formattedDate

    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});


// Order Update

router.get('/updateOrder/:id', async function (req, res) {
  const order = await Order.findOne({ where: { orderId: req.params.id } })
  const orderItems = await ProductPrice.findOne({ where: { orderFk: req.params.id } })
  // const store = await Store.findAll({where : {approve_b : 'approved'}})
  const product = await Product.findAll({ where: { approve_b: 'approved' } })
  const previousStore = await Store.findOne({ outletId: orderItems.outletId })

  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores } })


  res.render('order/orderUpdate', { title: 'Express', message: req.flash('message'), order, store, product, orderItems, previousStore });
});

router.get('/getItemsForOutlet/:outletId', async function (req, res) {
  try {
    const outletId = req.params.outletId;

    // Query the database to get item IDs related to the selected outlet
    const itemsForOutlet = await ProductStock.findAll({
      where: { outletId },
      attributes: ['itemId'],
    });
    //  console.log(55555555555555,itemsForOutlet)
    // Send the item IDs as JSON response
    res.json(itemsForOutlet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//getting all the product to populate the product dropdown in orderbilling page
router.get("/getProduct", async (req, res) => {
  // const itemId =req.params.itemId;
  try {
    const productdata = await NewProduct.findAll()
    // console.log(555566,productdata)
    res.json(productdata);
  }
  catch (err) {
    res.send(err.message, "Error while fetching the All product")
  }
});
//////////////////////////////////////////
router.get("/getProductById/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  try {
    const productdata = await Product.findOne({ where: { itemId: itemId } })
    res.json(productdata);
  }
  catch (err) {
    res.send(err.message, "Error while fetching the product based on itemid")
  }
});
//////////////////////getting the product price from productstock///////////////
router.get("/getpriceById/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  try {
    const productdata = await ProductStock.findOne({ where: { itemId: itemId } })
    res.json(productdata);
  }
  catch (err) {
    res.send(err.message, "Error while fetching the product based on itemid")
  }
});

//  route for the orderUpdate
// Define a route to fetch orderItems by order ID
router.get('/getOrderItems/:id', async function (req, res) {
  const orderItems = await ProductPrice.findAll({ where: { orderFk: req.params.id } });
  res.json(orderItems);
})

router.post('/updateOrder/:orderId', orderController.updateOrderItems);
// Define a POST route to update order items
// router.post('/updateOrderItems/:id', orderController.updateOrderItems);



// Upload Bulk Products

router.get('/uploadBulkProducts', function (req, res) {
  res.render('product/uploadBulkProduct', { title: 'express', message: req.flash('message') })
})

router.post('/uploadBulkProducts', bulkUpload.single('file'), productController.uploadBulkProducts)



// // product wise store wise stock quantity

// router.get('/getProductWiseStoreWiseStockQuantity', function (req,res) {

//   // Fetch all stores and products
// Store.findAll().then(stores => {
//   Product.findAll().then(products => {
//       // For each store and product combination, fetch the stock quantity
//       const results = [];
//       stores.forEach(store => {
//           products.forEach(product => {
//               ProductStock.findOne({
//                   where: { outletId: store.outletId, itemId: product.itemId }
//               }).then(stock => {
//                   results.push({
//                       storeName: store.storeName,
//                       itemName: product.itemName,
//                       stock: stock ? stock.stock : 0
//                   });
//                   if (results.length === stores.length * products.length) {
//                       // Render your HBS template with the 'results' array
//                       res.render('productWiseStoreWiseStockQuantity', { results });
//                   }
//               });
//           });
//       });
//   });
// });
// })

// // store wise product wise stock quantity

// router.get('/getStoreWiseProductWiseStockQuantity', function (req,res) {

//   // Fetch all stores and products
//   Store.findAll().then(stores => {
//       Product.findAll().then(products => {
//           // For each store and product combination, fetch the stock quantity
//           const results = [];
//           stores.forEach(store => {
//               products.forEach(product => {
//                   ProductStock.findOne({
//                       where: { outletId: store.outletId, itemId: product.itemId }
//                   }).then(stock => {
//                       results.push({
//                         storeName: store.storeName,
//                         itemName: product.itemName,
//                         stock: stock ? stock.stock : 0
//                       });
//                       if (results.length === stores.length * products.length) {
//                           // Render your HBS template with the 'results' array
//                           res.render('storeWiseProductWiseStockQuantity', { results });
//                       }
//                   });
//               });
//           });
//       });
//   });
// })

//================================================= Supplier Report=============================================
router.get("/supplierReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/supplierReport/supplierReport", { title: 'Express', store, message: req.flash('message') });
})
router.get('/supplierReportDetailsList', async function (req, res) {
  let draw = req.query.draw;
  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let outletId = req.query.outletId;

  // Check if start or length is NaN, and set default values if needed
  if (isNaN(start)) {
    start = 0;
  }

  if (isNaN(length)) {
    length = 10; // Set a default value or adjust as needed
  }

  let where = {};

  if (req.query.search && req.query.search.value) {
    where[Op.or] = [
      { Code: { [Op.like]: `%${req.query.search.value}%` } },
      { Name: { [Op.like]: `%${req.query.search.value}%` } },
      { Email: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  if (outletId) {
    where.storeFk = outletId;
  }

  const supplier = await SupplierMaster.findAndCountAll({
    where: { ...where, isDeleted: '0' },
    limit: length,
    offset: start
  });

  let data_arr = [];
  for (let i = 0; i < supplier.rows.length; i++) {
    data_arr.push({
      'Code': supplier.rows[i].Code,
      'Name': supplier.rows[i].Name,
      'Email': supplier.rows[i].Email,
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': supplier.count,
    'iTotalDisplayRecords': supplier.count,
    'aaData': data_arr
  };

  res.json(output);
});



//============================================================================================



//================================================= Customer Report=============================================
router.get("/customerReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/customerReport/customerReport", { title: 'Express', store, message: req.flash('message') });
})

router.get('/customerDetailsReport', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { Code: { [Op.like]: `%${req.query.search.value}%` } },
      { Name: { [Op.like]: `%${req.query.search.value}%` } },
      { Email: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const customer = await CustomerMaster.findAll({
    limit: length,
    offset: start,
    where: { ...where, isDeleted: '0' }
  })

  const count = await CustomerMaster.count({ where: { isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < customer.length; i++) {


    data_arr.push({
      'Code': customer[i].Code,
      'Name': customer[i].Name,
      'Email': customer[i].Email,
      // 'rowguid': customer[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});


//============================================================================================

//================================================= Purchase of goods of Report=============================================
router.get("/purchaseGoodsReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/purchaseReport/purchaseGoodsReport", { title: 'Express', store, message: req.flash('message') });
})

router.get('/purchaseGoodsReportData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  console.log(2742, startDate, endDate)
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
      // { referenceNumber: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await ProductPrice.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'In',
      orderType: 'order',
      //  isDeleted : '0'
    },
    include: [
      {
        model: NewProduct,
        attributes: ['itemName']
      },
      {
        model: Store,
        attributes: ['storeName']
      },
      {
        model: CustomerMaster
      },
      {
        model: Order,
        attributes: ['referenceNumber']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });


  console.log(order)

  const count = await ProductPrice.count({where : {stockType : "In", orderType : "order"}});

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      referenceNumber: order[i].order.referenceNumber,
      storeName: order[i].store_master.storeName,
      itemName: order[i].new_product.itemName,
      hsnCode: order[i].hsnCode,
      qty: order[i].qty,
      customer: order[i].Customer_Master.Name,
      taxPercentage: order[i].taxPercentage,
      taxAmount: order[i].taxAmount,
      // rowguid: order[i].rowguid,
      // approve_b: order[i].approve_b
    });
  }


  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});

//==============================================================================================



//================================================= Sale GST Report=============================================
router.get("/saleGSTReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/salesReport/saleGSTReport", { title: 'Express', store, message: req.flash('message') });
})



router.get('/saleGSTReportData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
      // { referenceNumber: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await ProductPrice.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      // stockType: ['Out'],
      orderType: ['order','SR']
    },
    include: [
      {
        model: NewProduct,
        attributes: ['itemName']
      },
      {
        model: Store,
        attributes: ['storeName']
      },
      {
        model: CustomerMaster,
        attributes: ['Name']
      },
      {
        model: Order,
        attributes: ['referenceNumber']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });


  console.log(order)

  const count = await ProductPrice.count({
    where: {
      stockType: 'Out',
      orderType: 'order'
    }
  });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      referenceNumber: order[i].order.referenceNumber,
      storeName: order[i].store_master.storeName,
      itemName: order[i].new_product.itemName,
      hsnCode: order[i].hsnCode,
      qty: order[i].qty,
      customer: order[i].Customer_Master.Name,
      taxPercentage: order[i].taxPercentage,
      taxAmount: order[i].taxAmount,
      // rowguid: order[i].rowguid,
      // approve_b: order[i].approve_b
    });
  }


  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  return res.json(output);
});


//================================================= Sale Return Report=============================================
router.get("/saleReturnReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/saleReturnReport/saleReturnReport", { title: 'Express', store, message: req.flash('message') });
})

router.get('/saleReturnReportData', async function (req, res) {
  let draw = req.query.draw
  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where,
      orderType: 'SR'
    },
    include: [
      //   // {
      //   //   model: NewProduct,
      //   //    attributes:['itemName']
      //   // },
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { orderType: 'SR' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      saleExecutive: order[i].saleExecutive,
      totalAmount: order[i].totalAmount,
      // rowguid: order[i].rowguid,
      // approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});



//============================================================================================


//================================================= Sale Quotation Report=============================================
router.get("/saleQuotationReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/saleQuotationReport/saleQuotationReport", { title: 'Express', store, message: req.flash('message') });
})


router.get('/saleQuotationReportListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await SaleQuotation.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'In',
      orderType: 'order'
    },
    include: [
      //   // {
      //   //   model: NewProduct,
      //   //    attributes:['itemName']
      //   // },
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await SaleQuotation.count({ where: { stockType: 'In', orderType: 'order' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      // rowguid: order[i].rowguid,
      // approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});


//============================================================================================
router.get('/customerDetailsList', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { Code: { [Op.like]: `%${req.query.search.value}%` } },
      { Name: { [Op.like]: `%${req.query.search.value}%` } },
      { Email: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const customer = await CustomerMaster.findAll({
    limit: length,
    offset: start,
    where: { ...where, isDeleted: '0' }
  })

  const count = await CustomerMaster.count({ where: { isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < customer.length; i++) {


    data_arr.push({
      'Code': customer[i].Code,
      'Name': customer[i].Name,
      'Email': customer[i].Email,
      'rowguid': customer[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});



//================================================= Sale Invoice Report=============================================
router.get("/saleInvoiceReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/salesReport/saleInvoiceReport", { title: 'Express', store, message: req.flash('message') });
})


router.get('/stockOutReportListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  console.log(2742, startDate, endDate)
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
      { referenceNumber: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'Out',
      orderType: 'order',
      isDeleted: '0'
    },
    include: [
      //   // {
      //   //   model: NewProduct,
      //   //    attributes:['itemName']
      //   // },
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { stockType: 'Out', orderType: 'order', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      // rowguid: order[i].rowguid,
      // approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});


//============================================================================================


//================================================= Purchase Cancel Report=============================================
router.get("/purchaseCancelReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/purchaseReport/purchaseCancelReport", { title: 'Express', store, message: req.flash('message') });
})


router.get('/purchaseInvoiceCancelReportListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  console.log(444, outletId)

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'Out',
      orderType: 'PR',
      isDeleted: '1'
    },
    include: [
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { stockType: 'Out', orderType: 'PR', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      // rowguid: order[i].rowguid,
      // approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});

//============================================================================================


//================================================= Purchase Return Report=============================================
router.get("/purchaseRetunReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/purchaseReport/purchaseReturnReport", { title: 'Express', store, message: req.flash('message') });
})


router.get('/purchaseInvoiceReturnReportListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  console.log(444, outletId)

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'Out',
      orderType: 'PR',
      isDeleted: '0'
    },
    include: [
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { stockType: 'Out', orderType: 'PR', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      // rowguid: order[i].rowguid,
      // approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});

//============================================================================================

//================================================= Purchase order Report=============================================
router.get("/purchaseOrderReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/purchaseReport/purchaseOrderReport", { title: 'Express', store, message: req.flash('message') });
})

router.get('/purchaseOrderReportListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await PurchaseOrder.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'In',
      orderType: 'order',
      isDeleted: '0'
    },
    include: [
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    order: [['orderId', 'DESC']],
    // where: where, // Apply the filtering
  });

  const count = await PurchaseOrder.count({ where: { stockType: 'In', orderType: 'order', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      purchaseOrderNo: order[i].purchaseOrderNo,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      // rowguid: order[i].rowguid,
      // approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});


//============================================================================================
//================================================= Purchase Invoice Report=============================================
router.get("/purchaseInvoiceReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/purchaseReport/purchaseInvoiceReport", { title: 'Express', store, message: req.flash('message') });
})

router.get('/purchaseInvoiceReportList', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  console.log(444, outletId)

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'In',
      orderType: 'order',
      isDeleted: '0'
    },
    include: [
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { stockType: 'In', orderType: 'order', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      // rowguid: order[i].rowguid,
      // approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});

//=============================================================================================


//================================================= employee Report=============================================
router.get("/employeeReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/employeeReport/employeeReport", { title: 'Express', store, message: req.flash('message') });
})

router.get('/employeeReportData', async function (req, res) {


  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    where[Op.or] = [
      { id: { [Op.like]: `%${req.query.search.value}%` } },
      { firstname: { [Op.like]: `%${req.query.search.value}%` } },
      { lastname: { [Op.like]: `%${req.query.search.value}%` } },
      { email: { [Op.like]: `%${req.query.search.value}%` } },
      { mobileNumber: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const user = await User.findAll({
    limit: length,
    offset: start,
    where: { ...where, isDeleted: '0' },
  })
  const count = await User.count()

  let data_arr = []
  for (let i = 0; i < user.length; i++) {
    data_arr.push({
      'id': user[i].id,
      'firstName': user[i].firstName,
      'lastName': user[i].lastName,
      'role': user[i].role,
      'email': user[i].email,
      // 'password': user[i].password,
      'mobileNumber': user[i].mobileNumber
    });
  }
  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };
  res.json(output)
})


//============================================================================================


//================================================= Brand Report=============================================
router.get("/brandReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/brandReport/brandReport", { title: 'Express', store, message: req.flash('message') });
})


router.get('/brandReportList', async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    where[Op.or] = [
      { shortDescription: { [Op.like]: `%${req.query.search.value}%` } },
      { longDescription: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const manufacturer = await Manufacturer.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"],
      isDeleted: '0'
    },
    limit: length,
    offset: start
  });

  const count = await Manufacturer.count({ where: { isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < manufacturer.length; i++) {
    data_arr.push({
      'manufacturerId': manufacturer[i].manufacturerId,
      'shortDescription': manufacturer[i].shortDescription,
      'longDescription': manufacturer[i].longDescription
    });
  }
  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
})


//==============================================================================================

//================================================= Item Report=============================================

router.get("/itemReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/itemReport/itemReport", { title: 'Express', store, message: req.flash('message') });
})


router.get('/itemReportList', async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { itemCode: { [Op.like]: `%${req.query.search.value}%` } },
      { itemName: { [Op.like]: `%${req.query.search.value}%` } },
      { description: { [Op.like]: `%${req.query.search.value}%` } },
      { status: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const product = await NewProduct.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"],
      isDeleted: '0'
    },
    limit: length,
    offset: start
  });

  const count = await NewProduct.count({ where: { isDeleted: '0' } })


  let data_arr = []
  for (let i = 0; i < product.length; i++) {
    data_arr.push({
      'itemCode': product[i].itemCode,
      'itemId': product[i].itemId,
      'itemName': product[i].itemName,
      'description': product[i].description,
      'imageUrl': product[i].imageUrl,
      'status': product[i].status,
      //'rowguid': product[i].rowguid,
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});





//==============================================================================================

//================================================= Tax Report=============================================

router.get("/taxReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/taxReport/taxReport", { title: 'Express', store, message: req.flash('message') });
})


router.get('/taxReportLListData', async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { Tax_Code: { [Op.like]: `%${req.query.search.value}%` } },
      { Description: { [Op.like]: `%${req.query.search.value}%` } },
      { Tax_percentage: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const taxval = await TaxMaster.findAll({
    limit: length,
    offset: start,
    where: { ...where, isDeleted: '0' }
  })

  const count = await TaxMaster.count({ where: { isDeleted: '0' } })



  let data_arr = []
  for (let i = 0; i < taxval.length; i++) {


    data_arr.push({
      'Tax_Code': taxval[i].Tax_Code,
      'Description': taxval[i].Description,
      'Tax_percentage': taxval[i].Tax_percentage,
      'rowguid': taxval[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});



//========================================================================================================

//================================================= Store Report=============================================
router.get("/storeReport", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // return console.log(7852,store)
  res.render("reports/storeReport/storeReport", { title: 'Express', store, message: req.flash('message') });
})



router.get('/storeReportDataList', async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let outletId = req.query.outletId[0];   // Retrieve outletId from the request
  // return console.log(852,outletId)

  let where = {}

  // if (outletId) {
  //   where.outletId = outletId;
  // }



  if (req.query.search.value) {
    where[Op.or] = [
      { code: { [Op.like]: `%${req.query.search.value}%` } },
      { storeName: { [Op.like]: `%${req.query.search.value}%` } },
      { businessType: { [Op.like]: `%${req.query.search.value}%` } },
      { address1: { [Op.like]: `%${req.query.search.value}%` } },
      { contactPersonName: { [Op.like]: `%${req.query.search.value}%` } },
      { contactNo1: { [Op.like]: `%${req.query.search.value}%` } },
      { status: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }
  const store = await Store.findAll({
    where: {
      ...where,
      approve_b: ["approved", "pending"],
      isDeleted: '0'
    },
    limit: length,
    offset: start
  });

  const count = await Store.count({ where: { isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < store.length; i++) {
    data_arr.push({
      'code': store[i].code,
      'storeName': store[i].storeName,
      'businessType': store[i].businessType,
      'address1': store[i].address1,
      'contactPersonName': store[i].contactPersonName,
      'contactNo1': store[i].contactNo1,
      'status': store[i].status,
      // 'rowguid': store[i].rowguid
    });
  }
  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };
  res.json(output)
})




router.get("/stockSummary", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  res.render("stockSummary/stockSummary", { title: 'Express', store, message: req.flash('message') });
})



///////////////// fetch product /////////////////////////

router.post('/fetchProducts', async (req, res) => {
  const outletId = req.body.outletId;
  //console.log(7878799,outletId)

  const allProducts = await ProductPrice.findAll({ where: { outletId } })
  let products = []
  products = allProducts.map(mapping => mapping.itemId)
  const allStoreProducts = await NewProduct.findAll({ where: { itemId: products } })
  //console.log(66222,allStoreProducts)
  res.json(allStoreProducts)

});


// listing of stock summary
router.post('/stockSummaryList', async function (req, res) {  // Change to POST request
  let draw = req.body.draw;
  let start = parseInt(req.body.start);
  let length = parseInt(req.body.length);
  let outletId = req.body.outletId;  // Retrieve outletId from the request


  const itemId = req.query.itemId; // Get the selected product ID from the request query


  let where = {};
  // Filter by product if a product ID is provided
  if (itemId) {
    where.itemId = itemId;
  }


  const alldata = await StockInOut.findAll({ where: { outletId: outletId } })




  if (req.body.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.body.search.value}%` } },
      { batchNo: { [Op.like]: `%${req.body.search.value}%` } },
      { qty: { [Op.like]: `%${req.body.search.value}%` } },
      { expDate: { [Op.like]: `%${req.body.search.value}%` } },
      { purchasePrice: { [Op.like]: `%${req.body.search.value}%` } },
      { salePriceInclTax: { [Op.like]: `%${req.body.search.value}%` } },
      { salePriceExclTax: { [Op.like]: `%${req.body.search.value}%` } },
    ];
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided


    const supplier = await StockInOut.findAndCountAll({
      include: [
        {
          model: NewProduct,
          // attributes:['itemName']
        }
      ],
      where: where,
      limit: length,
      offset: start
    });


    let data_arr = [];

    const uniqueEntries = {}; // Create an object to keep track of unique entries

    for (let i = 0; i < supplier.rows.length; i++) {
      let batchno = supplier.rows[i].batchNo;
      const InQtyBasedOnBatchAndOutletId = await StockInOut.sum('qty', { where: { outletId, batchNo: batchno, type: "In" } });
      const OutQtyBasedOnBatchAndOutletId = await StockInOut.sum('qty', { where: { outletId, batchNo: batchno, type: "Out" } });
      const calculatedQty = InQtyBasedOnBatchAndOutletId - OutQtyBasedOnBatchAndOutletId;

      if (supplier.rows[i].type === "In") {
        // Create a unique identifier for this entry
        const uniqueIdentifier = supplier.rows[i].new_product.itemName + supplier.rows[i].batchNo + calculatedQty;

        // Check if this entry is unique
        if (!uniqueEntries[uniqueIdentifier]) {
          // Add the entry to the result
          data_arr.push({
            'Product': supplier.rows[i].new_product.itemName,
            'Batch': supplier.rows[i].batchNo,
            'Exp Date': supplier.rows[i].expDate,
            'purchasePrice': supplier.rows[i].purchasePrice,
            'salePriceInclTax': supplier.rows[i].salePriceInclTax,
            'salePriceExclTax': supplier.rows[i].salePriceExclTax,
            'Net Qty': calculatedQty,
            'rowguid': supplier.rows[i].rowguid,
          });

          // Mark this entry as seen
          uniqueEntries[uniqueIdentifier] = true;
        }
      }
    }

    console.log(888, data_arr)

    let output = {
      'draw': draw,
      'iTotalRecords': supplier.count,
      'iTotalDisplayRecords': supplier.count,
      'aaData': data_arr
    };

    res.json(output);

  }
  else if (!outletId) {
    const supplier = await StockInOut.findAndCountAll({
      where: where,
      limit: length,
      offset: start
    });

    let data_arr = [];
    for (let i = 0; i < supplier.rows.length; i++) {
    }

    let output = {
      'draw': draw,
      'iTotalRecords': supplier.count,
      'iTotalDisplayRecords': supplier.count,
      'aaData': data_arr
    };

    res.json(output);
  }


});




//================================================= Stock Details =============================================

router.get("/stockDetail", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  res.render("stockDetails/stockDetails", { title: 'Express', store, message: req.flash('message') });
})


router.post('/stockDetailList', async function (req, res) {  // Change to POST request
  let draw = req.body.draw;
  let start = parseInt(req.body.start);
  let length = parseInt(req.body.length);
  let outletId = req.body.outletId;  // Retrieve outletId from the request

  const itemId = req.query.itemId; // Get the selected product ID from the request query


  let where = {};
  // Filter by product if a product ID is provided
  if (itemId) {
    where.itemId = itemId;
  }


  const alldata = await StockInOut.findAll({ where: { outletId: outletId } })



  if (req.body.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.body.search.value}%` } },
      { batchNo: { [Op.like]: `%${req.body.search.value}%` } },
      { expDate: { [Op.like]: `%${req.body.search.value}%` } },
      { purchasePrice: { [Op.like]: `%${req.body.search.value}%` } },
      { salePriceInclTax: { [Op.like]: `%${req.body.search.value}%` } },
      { salePriceExclTax: { [Op.like]: `%${req.body.search.value}%` } },
      { type: { [Op.like]: `%${req.body.search.value}%` } },
    ];
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided


    const supplier = await StockInOut.findAndCountAll({
      include: [
        {
          model: NewProduct,
        }
      ],
      where: where,
      limit: length,
      offset: start
    });


    let data_arr = [];
    for (let i = 0; i < supplier.rows.length; i++) {

      data_arr.push({
        'Product': supplier.rows[i].new_product.itemName,
        'Batch': supplier.rows[i].batchNo,
        'Exp Date': supplier.rows[i].expDate,
        'Type': supplier.rows[i].type,
        'purchasePrice': supplier.rows[i].purchasePrice,
        'salePriceInclTax': supplier.rows[i].salePriceInclTax,
        'salePriceExclTax': supplier.rows[i].salePriceExclTax,
        'Qty': supplier.rows[i].qty,
      });
    }

    let output = {
      'draw': draw,
      'iTotalRecords': supplier.count,
      'iTotalDisplayRecords': supplier.count,
      'aaData': data_arr
    };

    res.json(output);
  }
  else if (!outletId) {




    const supplier = await StockInOut.findAndCountAll({
      where: where,
      limit: length,
      offset: start
    });

    let data_arr = [];
    for (let i = 0; i < supplier.rows.length; i++) {
    }

    let output = {
      'draw': draw,
      'iTotalRecords': supplier.count,
      'iTotalDisplayRecords': supplier.count,
      'aaData': data_arr
    };

    res.json(output);
  }


});





// store wise product wise stock quantity

router.get('/getStoreWiseProduct', async function (req, res) {

  const stores = await Store.findAll({ where: { approve_b: 'approved' } })

  res.render('storeWiseStock', { title: 'Express', message: req.flash('message'), stores });

})

router.post('/getStoreWiseStock', async function (req, res) {

  const selectedStoreId = req.body.selectedStoreId;

  try {
    if (selectedStoreId === 'all') {

      const allStores = await Store.findAll({ where: { approve_b: 'approved' } });

      const allProducts = await Product.findAll({ where: { approve_b: 'approved' } });

      let productsWithStock = [];

      for (const store of allStores) {
        for (const product of allProducts) {
          const stock = await ProductStock.findOne({
            where: { approve_b: 'approved', outletId: store.outletId, itemId: product.itemId }
          });

          productsWithStock.push({
            store,
            product,
            stock: stock ? stock.stock : 0
          });
        }
      }
      // Render your HBS template with the 'productsWithStock' array and all stores
      res.render('storeWiseStock', { title: 'Express', message: req.flash('message'), productsWithStock, allStores, allProducts });
    } else {

      // Fetch the selected store
      const selectedStore = await Store.findOne({ where: { approve_b: 'approved', outletId: selectedStoreId } });

      if (!selectedStore) {
        req.flash('message', 'Selected store not found')
        return res.redirect('/getStoreWiseProduct')
      }

      // Fetch products available in the selected store
      const productsInStore = await Product.findAll({ where: { approve_b: 'approved' } });

      // Fetch stock quantities for each product in the selected store
      productsWithStock = [];

      for (const product of productsInStore) {
        const stock = await ProductStock.findOne({
          where: { approve_b: 'approved', outletId: selectedStoreId, itemId: product.itemId }
        });


        productsWithStock.push({
          store: selectedStore,
          product,
          stock: stock ? stock.stock : 0
        });
      }

      // Render your HBS template with the 'productsWithStock' array and the selected store
      res.render('storeWiseStock', { title: 'Express', message: req.flash('message'), productsWithStock, selectedStore });
    }
  } catch (error) {
    console.error(error);
    req.flash('message', 'An error while fetching data')
    return res.redirect('/getStoreWiseProduct')
  }
});




// product wise store wise stock quantity

router.get('/getProductWiseStock', async function (req, res) {

  const products = await Product.findAll({ where: { approve_b: 'approved' } })

  res.render('productWiseStock', { title: 'Express', message: req.flash('message'), products });
})

router.post('/getProductWiseStock', async function (req, res) {
  const selectedProductId = req.body.selectedProductId;
  try {
    if (selectedProductId === 'all') {

      const allProducts = await Product.findAll({ where: { approve_b: 'approved' } });

      const allStores = await Store.findAll({ where: { approve_b: 'approved' } });

      const storeWithStock = [];

      for (const product of allProducts) {
        for (const store of allStores) {
          const stock = await ProductStock.findOne({
            where: { approve_b: 'approved', outletId: store.outletId, itemId: product.itemId }
          });

          storeWithStock.push({
            product,
            store,
            stock: stock ? stock.stock : 0
          });
        }
      }

      // Render your HBS template with the 'storeWithStock' array and all products
      res.render('productWiseStock', { title: 'Express', message: req.flash('message'), storeWithStock, allProducts, allStores });
    } else {
      // Fetch the selected store
      const selectedProduct = await Product.findOne({ where: { approve_b: 'approved', itemId: selectedProductId } });

      if (!selectedProduct) {
        req.flash('message', 'Selected product not found')
        return res.redirect('/getProductWiseStock')
      }

      // Fetch products available in the selected store
      const stores = await Store.findAll({ where: { approve_b: 'approved' } });

      // Fetch stock quantities for each product in the selected store
      const storeWithStock = [];

      for (const store of stores) {

        const stock = await ProductStock.findOne({
          where: { approve_b: 'approved', outletId: store.outletId, itemId: selectedProductId }
        });

        storeWithStock.push({
          product: selectedProduct,
          store,
          stock: stock ? stock.stock : 0
        });
      }

      // Render your HBS template with the 'productsWithStock' array and the selected store
      res.render('productWiseStock', { title: 'Express', message: req.flash('message'), storeWithStock, selectedProduct });
    }
  } catch (error) {
    // Handle errors here
    req.flash('message', 'An error while fetching data')
    return res.redirect('/getProductWiseStock')
  }
});



//===================================================== Supplier Master===================



router.get('/supplierMaster', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores } })

  res.render('supplierMaster/supplierMaster', { title: 'Express', store });
});

// Endpoint to check code uniqueness
router.get('/checkCodeUnique/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const count = await SupplierMaster.count({
      where: {
        Code: code,
      },
    });
    const isUnique = count === 0;
    res.json({ isUnique });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking code uniqueness' });
  }
});



router.post("/createSuplierdata", supplierMasterController.createSuplier);


router.get('/suppliersMasterList', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores } })

  res.render('supplierMaster/supplierMasterList', { title: 'Express', store, message: req.flash('message') });
});


router.post('/supplierDetailsList', async function (req, res) {  // Change to POST request
  let draw = req.body.draw;
  let start = parseInt(req.body.start);
  let length = parseInt(req.body.length);
  let outletId = req.body.outletId;  // Retrieve outletId from the request


  let where = {};

  if (req.body.search.value) {
    where[Op.or] = [
      { Code: { [Op.like]: `%${req.body.search.value}%` } },
      { Name: { [Op.like]: `%${req.body.search.value}%` } },
      { Email: { [Op.like]: `%${req.body.search.value}%` } },
    ];
  }

  if (outletId) {

    where.storeFk = outletId  // Filter by outletId if provided
  }

  const supplier = await SupplierMaster.findAndCountAll({
    where: { ...where, isDeleted: '0' },
    limit: length,
    offset: start
  });

  let data_arr = [];
  for (let i = 0; i < supplier.rows.length; i++) {
    data_arr.push({
      'Code': supplier.rows[i].Code,
      'Name': supplier.rows[i].Name,
      'Email': supplier.rows[i].Email,
      'rowguid': supplier.rows[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': supplier.count,
    'iTotalDisplayRecords': supplier.count,
    'aaData': data_arr
  };

  res.json(output);
});



router.get('/updateSupplierMaster/:uuid', checkUser, async function (req, res) {
  // console.log(219874651,req.params.uuid)
  const supplier = await SupplierMaster.findOne({ where: { rowguid: req.params.uuid } })
  const previousStore = await Store.findOne({ where: { outletId: supplier.storeFk } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores } })

  res.render('supplierMaster/supplierMasterUpdate', { title: 'Express', supplier, previousStore, store });
});


//get route for getting all the data of supplier

router.get("/getAllsupplierdata", supplierMasterController.supplierData)

router.post("/supplierMasterUpdate/:uuid", supplierMasterController.updateSuplier)


//supplier delete 

router.post('/deleteSupplier/:id', async (req, res) => {
  const supplier = await SupplierMaster.findOne({ where: { rowguid: req.params.id } })
  await supplier.update({ isDeleted: '1' })
  return res.json(true)
});


// getting all the store in supplier master




/********************************State Master*********************************** */
router.get("/stateMaster", checkUser, (req, res) => {
  res.render("stateMaster/stateMaster", { title: 'Express', message: req.flash('message') });
})


router.post("/createStateMaster", stateMasterController.createStateMaster)

//state master listing
router.get('/stateMasterList', checkUser, async function (req, res) {
  res.render('stateMaster/stateMasterList', { title: 'Express', message: req.flash('message') });
});


router.get('/stateDetailsList', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { Code: { [Op.like]: `%${req.query.search.value}%` } },
      { Name: { [Op.like]: `%${req.query.search.value}%` } },
      { Status: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const state = await StateMaster.findAll({
    limit: length,
    offset: start,
    where: { ...where, isDeleted: '0' }
  })

  const count = await StateMaster.count({ where: { isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < state.length; i++) {


    data_arr.push({
      'Code': state[i].Code,
      'Name': state[i].Name,
      'Status': state[i].Status,
      'rowguid': state[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});


// delete state
router.post('/deleteState/:id', async (req, res) => {
  const state = await StateMaster.findOne({ where: { rowguid: req.params.id } })
  await state.update({ isDeleted: '1' })
  return res.json(true)
});



//state master update

router.get("/updateStateMaster/:uuid", checkUser, async (req, res) => {
  const state = await StateMaster.findOne({ where: { rowguid: req.params.uuid } })

  res.render("stateMaster/stateMasterUpdate", { title: 'Express', message: req.flash('message'), state });
})

router.post("/stateMasterUpdate/:uuid", stateMasterController.updateStateMaster)

/********************************State Master*********************************** */


/*******************************Tax Master********************************** */

router.get("/taxMaster", checkUser, (req, res) => {
  res.render("TaxMaster/taxMaster", { title: 'Express', message: req.flash('message') });
})


// Endpoint to check code uniqueness
router.get('/checkTaxCodeIsUnique/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const count = await TaxMaster.count({
      where: {
        Tax_Code: code,
      },
    });
    const isUnique = count === 0;
    res.json({ isUnique });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking code uniqueness' });
  }
});




//post the taxMaster
router.post("/createTaxMaster", taxMasterController.createTax)

//fetching all the state 

router.get("/allState", async (req, res) => {
  try {
    const Allstate = await StateMaster.findAll({
      where: { Status: "Active" },
      attributes: ['id', 'Code', 'Name'],
    });
    // console.log(555555, Allstate);
    res.status(200).json(Allstate);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//============================== tax master listing========================================
router.get('/taxMasterList', checkUser, async function (req, res) {
  res.render('TaxMaster/taxMasterList', { title: 'Express', message: req.flash('message') });
});


router.get('/taxDetailsList', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { Tax_Code: { [Op.like]: `%${req.query.search.value}%` } },
      { Description: { [Op.like]: `%${req.query.search.value}%` } },
      { Tax_percentage: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const taxval = await TaxMaster.findAll({
    limit: length,
    offset: start,
    where: { ...where, isDeleted: '0' }
  })

  const count = await TaxMaster.count({ where: { isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < taxval.length; i++) {


    data_arr.push({
      'Tax_Code': taxval[i].Tax_Code,
      'Description': taxval[i].Description,
      'Tax_percentage': taxval[i].Tax_percentage,
      'rowguid': taxval[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});


// delete state
router.post('/deleteTax/:id', async (req, res) => {
  const tax = await TaxMaster.findOne({ where: { rowguid: req.params.id } })
  await tax.update({ isDeleted: '1' })
  return res.json(true)
});

//tax master update

router.get("/updateTaxMaster/:uuid", checkUser, async (req, res) => {
  const tax = await TaxMaster.findOne({ where: { rowguid: req.params.uuid } })
  // console.log(99999999999,tax)

  const stateNameById = await StateMaster.findOne({ where: { id: tax.State_Code } })


  res.render("TaxMaster/taxMasterUpdate", { title: 'Express', message: req.flash('message'), tax, stateNameById });
})

router.post("/taxMasterUpdate/:uuid", taxMasterController.updateTax)

/*******************************Customer Master********************************** */

router.get("/customerMaster", checkUser, (req, res) => {
  res.render("CustomerMaster/customerMaster", { title: 'Express', message: req.flash('message') });
})

// Endpoint to check code uniqueness
router.get('/checkCustomerCodeIsUnique/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const count = await CustomerMaster.count({
      where: {
        Code: code,
      },
    });
    const isUnique = count === 0;
    res.json({ isUnique });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking code uniqueness' });
  }
});


//post the taxMaster
router.post("/createCustomerMaster", customerMasterController.createCustomer)

router.get('/customerMasterList', checkUser, async function (req, res) {
  res.render('CustomerMaster/customerMasterList', { title: 'Express', message: req.flash('message') });
});


///////listing
router.get('/customerDetailsList', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { Code: { [Op.like]: `%${req.query.search.value}%` } },
      { Name: { [Op.like]: `%${req.query.search.value}%` } },
      { Email: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const customer = await CustomerMaster.findAll({
    limit: length,
    offset: start,
    where: { ...where, isDeleted: '0' }
  })

  const count = await CustomerMaster.count({ where: { isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < customer.length; i++) {


    data_arr.push({
      'Code': customer[i].Code,
      'Name': customer[i].Name,
      'Email': customer[i].Email,
      'rowguid': customer[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});





//updating

router.get('/updateCustomerMaster/:uuid', checkUser, async function (req, res) {
  const customer = await CustomerMaster.findOne({ where: { rowguid: req.params.uuid } })
  res.render('CustomerMaster/CustomerMasterUpdate', { title: 'Express', message: req.flash('message'), customer });
});

router.post("/customerMasterUpdate/:uuid", customerMasterController.updateCustomer)


//customer delete 

router.post('/deleteCustomer/:id', async (req, res) => {
  const customer = await CustomerMaster.findOne({ where: { rowguid: req.params.id } })
  await customer.update({ isDeleted: '1' })
  return res.json(true)
});


/*******************************Category Master********************************** */
router.get("/categoryMaster", checkUser, (req, res) => {
  res.render("categoryMaster/categoryMaster", { title: 'Express', message: req.flash('message') });
})

//post the category master
router.post("/createCategoryMaster", codeMasterController.createCategory)

// delete category
router.post('/deleteCategory/:id', async (req, res) => {
  const category = await CodeMaster.findOne({ where: { rowguid: req.params.id } })
  await category.update({ isDeleted: '1' })
  return res.json(true)
});


/// listing of  category master

router.get('/codeCategoryMasterList', checkUser, async function (req, res) {
  res.render('categoryMaster/categoryMasterList', { title: 'Express', message: req.flash('message') });
});


router.get('/codeCategoryDetailsList', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { code_name: { [Op.like]: `%${req.query.search.value}%` } },
      { code_level: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const itemtype = await CodeMaster.findAll({
    where: {
      ...where,
      code_level: '1',
      isDeleted: '0'
    },
    limit: length,
    offset: start,
  })

  const count = await CodeMaster.count({ where: { code_level: '1', isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < itemtype.length; i++) {


    data_arr.push({
      'code_name': itemtype[i].code_name,
      'code_level': itemtype[i].code_level,
      'Active': itemtype[i].Active,
      'rowguid': itemtype[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});


//


//updating the category

router.get('/updateCategoryMaster/:uuid', checkUser, async function (req, res) {
  const itemType = await CodeMaster.findOne({ where: { rowguid: req.params.uuid } })
  const val = await CodeMaster.findOne({ where: { id: itemType.ParentPk } })

  res.render('categoryMaster/updateCategoryMaster', { title: 'Express', message: req.flash('message'), itemType, val });
});


router.post("/codeCategoryMasterUpdate/:uuid", codeMasterController.updateCategory)






/*******************************Department Master********************************** */
router.get("/departmentMaster", checkUser, (req, res) => {
  res.render("departmentMaster/departmentMaster", { title: 'Express', message: req.flash('message') });
})

//post the category master
router.post("/createDepartmentMaster", codeMasterController.createDepartment)

//department delete 

router.post('/deleteDepartment/:id', async (req, res) => {
  const department = await CodeMaster.findOne({ where: { rowguid: req.params.id } })
  await department.update({ isDeleted: '1' })
  return res.json(true)
});

// getting all the category

router.get("/allCategory", async (req, res) => {
  try {
    const Allcategory = await CodeMaster.findAll({
      where: { code_level: "1" },
      attributes: ['id', 'code_name', "Active"],
    });
    // console.log(555555, Allstate);
    res.status(200).json(Allcategory);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/// listing of  Department master

router.get('/departmentMasterList', checkUser, async function (req, res) {
  res.render('departmentMaster/departmentMasterList', { title: 'Express', message: req.flash('message') });
});

router.get('/departmentDetailsList', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { code_name: { [Op.like]: `%${req.query.search.value}%` } },
      { code_level: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const itemtype = await CodeMaster.findAll({
    where: {
      ...where,
      code_level: '2',
      isDeleted: '0'
    },
    limit: length,
    offset: start,
  })

  const count = await CodeMaster.count({ where: { code_level: '2', isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < itemtype.length; i++) {


    data_arr.push({
      'code_name': itemtype[i].code_name,
      'code_level': itemtype[i].code_level,
      'Active': itemtype[i].Active,
      'rowguid': itemtype[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});


//updating the department

router.get('/updateDepartmentMaster/:uuid', checkUser, async function (req, res) {
  const itemType = await CodeMaster.findOne({ where: { rowguid: req.params.uuid } })
  const val = await CodeMaster.findOne({ where: { id: itemType.ParentPk } })


  res.render('departmentMaster/updateDepartmentMaster', { title: 'Express', itemType, val });
});

router.post("/departmentMasterUpdate/:uuid", codeMasterController.updateDepartment)












/*******************************Group Master********************************** */
router.get("/groupMaster", checkUser, (req, res) => {
  res.render("groupMaster/groupMaster", { title: 'Express', message: req.flash('message') });
})

//post the category master
router.post("/createGroupMaster", codeMasterController.createGroup)


// getting all the category

router.get("/allgroup", async (req, res) => {
  try {
    const Allgroup = await CodeMaster.findAll({
      where: { code_level: "2" },
      attributes: ['id', 'code_name', "Active"],
    });
    // console.log(555555, Allstate);
    res.status(200).json(Allgroup);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



/// listing of  group master

router.get('/groupMasterList', checkUser, async function (req, res) {
  res.render('groupMaster/groupMasterList', { title: 'Express', message: req.flash('message') });
});
router.get('/groupDetailsList', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { code_name: { [Op.like]: `%${req.query.search.value}%` } },
      { code_level: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const itemtype = await CodeMaster.findAll({
    where: {
      ...where,
      code_level: '3',
      isDeleted: '0'
    },
    limit: length,
    offset: start,
  })

  const count = await CodeMaster.count({ where: { code_level: '3', isDeleted: '0' } })

  let data_arr = []
  for (let i = 0; i < itemtype.length; i++) {


    data_arr.push({
      'code_name': itemtype[i].code_name,
      'code_level': itemtype[i].code_level,
      'Active': itemtype[i].Active,
      'rowguid': itemtype[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});

//updating the group

router.get('/updateGroupMaster/:uuid', checkUser, async function (req, res) {
  const itemType = await CodeMaster.findOne({ where: { rowguid: req.params.uuid } })
  const val = await CodeMaster.findOne({ where: { id: itemType.ParentPk } })

  res.render('groupMaster/updateGroupMaster', { title: 'Express', itemType, val });
});

router.post("/groupMasterUpdate/:uuid", codeMasterController.updateGroup)


//group delete 

router.post('/deleteGroup/:id', async (req, res) => {
  const group = await CodeMaster.findOne({ where: { rowguid: req.params.id } })
  await group.update({ isDeleted: '1' })
  return res.json(true)
});









/*******************************ItemType Master********************************** */
router.get("/itemTypeMaster", checkUser, (req, res) => {
  res.render("itemTypeMaster/itemTypeMaster", { title: 'Express', message: req.flash('message') });
})

//post the category master
router.post("/itemTypeMaster", codeMasterController.createItemType)


// getting all the category

router.get("/allitemtype", async (req, res) => {
  try {
    const Allgroup = await CodeMaster.findAll({
      where: { code_level: "3" },
      attributes: ['id', 'code_name', "Active"],
    });
    // console.log(555555, Allstate);
    res.status(200).json(Allgroup);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


/// listing of item type

router.get('/itemtypeMasterList', checkUser, async function (req, res) {
  res.render('itemTypeMaster/itemtypeMasterList', { title: 'Express', message: req.flash('message') });
});

router.get('/itemTypeDetailsList', async function (req, res) {
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}

  if (req.query.search.value) {
    where[Op.or] = [
      { code_name: { [Op.like]: `%${req.query.search.value}%` } },
      { code_level: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const itemtype = await CodeMaster.findAll({
    where: {
      ...where,
      code_level: '4'
    },
    limit: length,
    offset: start,
  })

  const count = await CodeMaster.count({ where: { code_level: '4' } })

  let data_arr = []
  for (let i = 0; i < itemtype.length; i++) {


    data_arr.push({
      'code_name': itemtype[i].code_name,
      'code_level': itemtype[i].code_level,
      'Active': itemtype[i].Active,
      'rowguid': itemtype[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': count,
    'iTotalDisplayRecords': count,
    'aaData': data_arr
  };

  res.json(output)
});


//updating the item type

router.get('/updateItemTypeMaster/:uuid', checkUser, async function (req, res) {
  const itemType = await CodeMaster.findOne({ where: { rowguid: req.params.uuid } })
  const val = await CodeMaster.findOne({ where: { id: itemType.ParentPk } })

  res.render('itemTypeMaster/itemTypeMasterUpdate', { title: 'Express', itemType, val });
});

router.post("/itemTypeMasterUpdate/:uuid", codeMasterController.updateItemType)

router.post("/upload", upload.single('imageUrl'), async function (req, res) {

  //  Image upload
  if (req.file) {
    const tmp_path = req.file.path;
    req.body.newFileName = req.file.originalname
    //  The original name of the uploaded file stored in the variable "originalname"
    const target_path = `public/uploads/${req.body.newFileName}`;
    //  A better way to copy the uploaded file. 
    const src = fs.createReadStream(tmp_path);

    const dest = fs.createWriteStream(target_path);
    src.pipe(dest);
    src.on('end', function () { });
    src.on('error', function (err) { });
  }
  res.json('ok')
})


router.post("/uploadImageInProductUpdate/:itemId", upload.single('imageUrl'), async function (req, res) {
  const itemId = req.params.itemId
  //  Image upload
  if (req.file) {
    const tmp_path = req.file.path;
    req.body.newFileName = req.file.originalname
    //  The original name of the uploaded file stored in the variable "originalname"
    const target_path = `public/uploads/${req.body.newFileName}`;
    //  A better way to copy the uploaded file. 
    const src = fs.createReadStream(tmp_path);

    const dest = fs.createWriteStream(target_path);
    src.pipe(dest);
    src.on('end', function () { });
    src.on('error', function (err) { });
    await ProductImage.create({
      itemId: itemId,
      imageUrl: req.body.newFileName
    })
  }
  res.json('ok')
})








// Api's for application 

// login api 

router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Opssss....Please Enter Email and Password Properly'
      });
    }

    const user = await User.findOne({ where: { email: req.body.email } })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Awww....User not found'
      });
    }

    let passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(400).json({
        success: false,
        message: 'Aww.. You entered wrong password'
      });
    }

    // let token = jwt.sign({ id: user.id }, config.secret, {
    //   expiresIn: "24H" // 24 hours
    // });

    // return res.status(200).send({
    //   success : true,
    //   username : user.firstName + " " + user.lastName,
    //   accessToken: token
    // })
    return res.status(200).json({
      success: true,
      message: 'You are now login Successfully.',
      user: user.id,
      role: user.role
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }

});


//store api

// get state api
router.get("/api/getState", async (req, res) => {
  try {
    const state = await StateMaster.findAll({ where: { status: 'Active' } })
    res.status(200).json({
      success: true,
      message: "All states fetched successfully",
      state: state
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: true,
      message: "something went wrong"
    })
  }
})

// get category api
router.get("/api/getCategory", async (req, res) => {
  try {
    const category = await CodeMaster.findAll({ where: { code_level: 1, Active: 'Active' } })
    res.status(200).json({
      success: true,
      message: "All category fetched successfully",
      category: category
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: true,
      message: "something went wrong"
    })
  }
})

// create Store Api for app integration 
router.post("/api/createStore/:userId", storeController.createAppStore);


// store list

router.get('/api/newStoremasterList', async function (req, res) {
  try {
    const draw = parseInt(req.query.draw);
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const search = req.query.search.value;

    let where = {};

    if (search) {
      where[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { storeName: { [Op.like]: `%${search}%` } },
        { businessType: { [Op.like]: `%${search}%` } },
        { address1: { [Op.like]: `%${search}%` } },
        { contactPersonName: { [Op.like]: `%${search}%` } },
        { contactNo1: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } },
      ];
    }

    const store = await Store.findAll({
      where: {
        ...where,
        approve_b: ["approved", "pending"],
      },
      limit: length,
      offset: start,
    });

    const count = await Store.count({ where });

    const data_arr = store.map((storeItem) => ({
      code: storeItem.code,
      storeName: storeItem.storeName,
      businessType: storeItem.businessType,
      address1: storeItem.address1,
      contactPersonName: storeItem.contactPersonName,
      contactNo1: storeItem.contactNo1,
      status: storeItem.status,
      rowguid: storeItem.rowguid,
    }));

    const output = {
      draw,
      recordsTotal: count,
      recordsFiltered: count,
      data: data_arr,
    };

    res.status(200).json({
      success: true,
      message: "All stores fetched successfully",
      stores: output
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
});


// update store get api 
router.get('/api/getUpdateStore/:id', async function (req, res) {

  try {
    let store = await Store.findOne({ where: { rowguid: req.params.id } })

    const state = await StateMaster.findOne({ where: { id: store.state } })

    const taxState = await StateMaster.findOne({ where: { id: store.taxState } })

    const storeCategory = await StoreCategoryMapping.findOne({ where: { storeFk: store.outletId } })

    const category = await CodeMaster.findOne({ id: storeCategory.categoryFk })

    res.status(200).json({
      success: true,
      message: "Update store data fetched successfully",
      store: store,
      state: state,
      taxState: taxState,
      category: category
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }

});

// update store post api
router.put("/api/updateStore/:userId/:storeId", storeController.updateAppStore);



// User Api

// get all stores
router.get('/api/getAllStores', async (req, res) => {
  try {
    const stores = await Store.findAll({ where: { status: 'Active' } })
    res.status(200).json({
      success: true,
      message: "All store are fetched successfully",
      stores: stores
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "something went wrong"
    })
  }
});

//get role wise manager
router.get('/api/getManagers/:role', async (req, res) => {

  try {
    const role = req.params.role;
    const users = await User.findAll({ where: { role: role } });
    const managers = users.map((manager) => ({
      id: manager.id,
      email: manager.email,
    }))
    res.status(200).json({
      success: true,
      message: `This users are ${role}`,
      managers: managers
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "something went wrong"
    })
  }
});

// get store user wise
router.get('/api/getSelectedStores/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {

    const user = await User.findOne({ where: { id: userId } })
    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const userRole = user.role

    let storeIdsToFetch = []

    if (userRole === 'super admin') {
      const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
      storeIdsToFetch = userStoreMapping.map(mapping => mapping.storeFk)
      // console.log(123456, storeIdsToFetch)
    } else if (userRole === 'admin') {
      const managedStoreIds = await UserStoreMapping.findAll({ where: { userFk: userId } });
      storeIdsToFetch = managedStoreIds.map(mapping => mapping.storeFk);
    }

    const store = await Store.findAll({ where: { outletId: storeIdsToFetch, status: 'Active' } })

    let arr = []
    let userStoreIds = []

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
    res.status(200).json({
      success: true,
      message: "User selected stores are fetched successfully",
      userSelectedStores: arr
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "something went wrong"
    })
  }
})

// create user api
router.post('/api/createUser/:userId', userController.createAppUser)

// get user list data

router.get('/api/userList', async function (req, res) {
  try {
    const draw = parseInt(req.query.draw);
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;

    let where = {};

    if (searchValue) {
      where[Op.or] = [
        { id: { [Op.like]: `%${searchValue}%` } },
        { firstname: { [Op.like]: `%${searchValue}%` } },
        { lastname: { [Op.like]: `%${searchValue}%` } },
        { email: { [Op.like]: `%${searchValue}%` } },
        { mobileNumber: { [Op.like]: `%${searchValue}%` } },
      ];
    }

    const users = await User.findAll({
      limit: length,
      offset: start,
      where,
    });

    const count = await User.count({ where });

    const data_arr = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email,
      password: user.password,
      mobileNumber: user.mobileNumber,
    }));

    const output = {
      draw,
      recordsTotal: count,
      recordsFiltered: count,
      data: data_arr,
    };

    res.status(200).json({
      success: true,
      message: "All Users fetched successfully",
      users: output
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
});


//get manager store and user store shows in selected check box in update user page
router.get('/api/getSelectedManagerStores/:managerId/:userId', async (req, res) => {
  try {
    const managerId = req.params.managerId;

    const store = await Store.findAll({ where: { status: 'Active' } });
    const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: managerId } });

    const managerSelectedStore = [];
    for (let i = 0; i < userStoreMapping.length; i++) {
      managerSelectedStore.push(userStoreMapping[i].storeFk);
    }

    // Check if managerFk is -1 and populate all stores as selected
    if (managerId === '-1') {
      for (let i = 0; i < store.length; i++) {
        managerSelectedStore.push(store[i].outletId);
      }
    }

    const stores = await Store.findAll({ where: { outletId: managerSelectedStore } });

    const userId = req.params.userId;
    const userStoreMappingUser = await UserStoreMapping.findAll({ where: { userFk: userId } });
    const userSelectedStore = [];
    for (let i = 0; i < userStoreMappingUser.length; i++) {
      userSelectedStore.push(userStoreMappingUser[i].storeFk);
    }

    // Modify your existing code to add the "checked" property to stores
    for (let i = 0; i < stores.length; i++) {
      const storeId = stores[i].outletId;
      stores[i].dataValues.checked = userSelectedStore.includes(storeId);
    }

    res.status(200).json({
      success: true,
      message: "All user stores fetched successfully",
      stores: stores
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
})

router.get('/api/getUpdateUser/:id', async function (req, res) {
  try {
    const user = await User.findOne({ where: { id: req.params.id } })

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      message: "user details fetched successfully",
      user: user
    })
  } catch {
    res.status(500).json({
      success: false,
      message: "something went wrong"
    })
  }
});


router.put('/api/updateUser/:userId/:id', userController.updateAppUser)


// Product api

// Get brand api
router.get('/api/brand', async (req, res) => {
  try {
    const brand = await Manufacturer.findAll({ where: { status: 'Active' } })
    res.status(200).json({
      success: true,
      message: "All brands fetched successfully",
      brand: brand
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong"
    })
  }
});

// get department api
router.get('/api/departments/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await CodeMaster.findOne({ where: { id: categoryId, code_level: 1, Active: 'Active' } })

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found"
      })
    }
    const departments = await CodeMaster.findAll({ where: { code_level: 2, ParentPk: categoryId, Active: 'Active' } });
    res.status(200).json({
      success: true,
      message: "All departments fetched successfully",
      departments: departments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong"
    })
  }
});

// get group api
router.get('/api/groups/:departmentId', async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const department = await CodeMaster.findOne({ where: { id: departmentId, code_level: 2, Active: 'Active' } })

    if (!department) {
      res.status(404).json({
        success: false,
        message: "Department not found"
      })
    }
    const groups = await CodeMaster.findAll({ where: { code_level: 3, ParentPk: departmentId, Active: 'Active' } });
    res.status(200).json({
      success: true,
      message: "All groups fetched successfully",
      groups: groups
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong"
    })
  }
});

// get tax percentage api
router.get('/api/taxPercentage', async (req, res) => {
  try {
    const taxPercentage = await TaxMaster.findAll({ where: { Status: 'Active' } })
    res.status(200).json({
      success: true,
      message: "All tax details fetched successfully",
      taxPercentage: taxPercentage
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong"
    })
  }
});

// Image upload in public folder
router.post("/api/upload", upload.single('imageUrl'), async function (req, res) {
  try {
    if (req.file) {
      const tmp_path = req.file.path;
      // req.body.newFileName = `${new Date().getTime()}_${req.file.originalname}`;
      req.body.newFileName = req.file.originalname
      //  The original name of the uploaded file stored in the variable "originalname"
      const target_path = `public/uploads/${req.body.newFileName}`;
      //  A better way to copy the uploaded file. 
      const src = fs.createReadStream(tmp_path);

      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);
      src.on('end', function () { });
      src.on('error', function (err) { });
    }
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully in public folder',
      imageName: req.body.newFileName,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: "something went wrong" });
  }
})

// Image delete from public folder
router.delete('/api/deleteImageWithoutItemId/:image', async (req, res) => {
  try {
    const image = req.params.image;
    // Get the absolute path of the project
    const projectPath = path.resolve(__dirname, '..'); // Assuming your route file is in the 'routes' directory
    // Construct the correct image path
    const imagePath = path.join(projectPath, 'public', 'uploads', image);
    fs.unlinkSync(imagePath)
    res.status(200).json({ success: true, message: "Image Deleted Successfully from public folder" });
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

// create product api for app
router.post('/api/createProduct', upload.single('imageUrl'), productController.createAppProduct)


// get data of update product api
router.get('/api/updateProduct/:id', async function (req, res) {
  try {
    const product = await NewProduct.findOne({ where: { rowguid: req.params.id } })

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    const category = await CodeMaster.findOne({ where: { id: product.category } })

    const department = await CodeMaster.findOne({ where: { id: product.department } })

    const group = await CodeMaster.findOne({ where: { id: product.group } })

    const manufacturer = await Manufacturer.findOne({ where: { manufacturerId: product.brand } })

    const taxPercentage = await TaxMaster.findOne({ where: { id: product.tax } })

    res.status(200).json({
      success: true,
      message: "Product details are successfully fetched",
      product: product,
      category: category,
      department: department,
      group: group,
      manufacturer: manufacturer,
      taxPercentage: taxPercentage
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
});

// populate previous images in update product
router.get('/api/getProductImages/:itemId', async function (req, res) {

  try {
    const itemId = req.params.itemId

    const product = await NewProduct.findOne({ where: { itemId: itemId } })

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    const images = await ProductImage.findAll({ where: { itemId: itemId } })
    res.status(200).json({
      success: true,
      message: "All images of this product are successfully fetched",
      images: images
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: "something went wrong" });
  }
})

// Image upload in public folder and product table in update product page
router.post("/api/uploadImageInProductUpdate/:itemId", upload.single('imageUrl'), async function (req, res) {
  try {
    const itemId = req.params.itemId

    const product = await NewProduct.findOne({ where: { itemId: itemId } })

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }
    //  Image upload
    if (req.file) {
      const tmp_path = req.file.path;
      req.body.newFileName = req.file.originalname
      //  The original name of the uploaded file stored in the variable "originalname"
      const target_path = `public/uploads/${req.body.newFileName}`;
      //  A better way to copy the uploaded file. 
      const src = fs.createReadStream(tmp_path);

      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);
      src.on('end', function () { });
      src.on('error', function (err) { });
      await ProductImage.create({
        itemId: itemId,
        imageUrl: req.body.newFileName
      })
    }
    res.status(200).json({
      success: true,
      message: 'Image Uploaded Successfully',
      imageName: req.body.newFileName
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    })
  }
})

// Define a route to delete an image in update new product page
router.delete('/api/deleteImage/:image/:itemId', async (req, res) => {
  try {
    const image = req.params.image;
    const itemId = req.params.itemId

    const productImage = await ProductImage.findOne({
      where: { imageUrl: image, itemId: itemId },
    });

    if (!productImage) {
      res.status(404).json({
        success: false,
        message: "Image of this selected product not found"
      })
    }

    const deletedRows = await ProductImage.destroy({
      where: { imageUrl: image, itemId: itemId },
    });

    // Get the absolute path of the project
    const projectPath = path.resolve(__dirname, '..'); // Assuming your route file is in the 'routes' directory

    // Construct the correct image path
    const imagePath = path.join(projectPath, 'public', 'uploads', image);

    fs.unlinkSync(imagePath)

    res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'something went wrong'
    });
  }
});

// update product api for app
router.post('/api/updateProduct/:id', upload.single('imageUrl'), productController.updateAppProduct)

// get product list data
router.get('/api/newProductsList', async function (req, res) {
  try {
    let draw = parseInt(req.query.draw);
    let start = parseInt(req.query.start);
    let length = parseInt(req.query.length);

    let where = {};

    if (req.query.search.value) {
      where[Op.or] = [
        { itemCode: { [Op.like]: `%${req.query.search.value}%` } },
        { itemName: { [Op.like]: `%${req.query.search.value}%` } },
        { description: { [Op.like]: `%${req.query.search.value}%` } },
        { status: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const products = await NewProduct.findAll({
      where: {
        ...where,
        approve_b: ["approved", "pending"],
      },
      limit: length,
      offset: start,
    });

    const count = await NewProduct.count();

    let data_arr = products.map((product) => ({
      itemCode: product.itemCode,
      itemId: product.itemId,
      itemName: product.itemName,
      description: product.description,
      imageUrl: product.imageUrl,
      status: product.status,
      rowguid: product.rowguid,
    }));


    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: {
        totalRecords: count,
        products: data_arr,
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});





// Stock In Apis

// Get user store 
router.get('/api/getUserStore/:userId', async function (req, res) {
  try {
    const userId = req.params.userId

    const user = await User.findOne({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
    let userStores = []
    userStores = userStoreMapping.map(mapping => mapping.storeFk)
    const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
    return res.status(200).json({
      success: true,
      message: "User stores are fetched successfully",
      store: store
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

//get supplier
router.get('/api/getAllSuppliers/:outletId', async function (req, res) {
  try {
    const outletId = req.params.outletId
    const store = await Store.findOne({ where: { outletId: outletId } })
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      })
    }
    const suppliers = await SupplierMaster.findAll({ where: { storeFk: outletId, Status: 'Active' } })
    return res.status(200).json({
      success: true,
      message: "All suppliers of selected store are fetched successfully",
      suppliers: suppliers
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// populate the supplier detail into stock In
router.get('/api/getSupplierDetails/:supplierId', async function (req, res) {
  try {
    const supplierId = req.params.supplierId
    const supplier = await SupplierMaster.findOne({ where: { id: supplierId } })
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Supplier details are successfully fetched",
      supplier: supplier
    })
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

//Get all Products
router.get('/api/getAllProduct', async function (req, res) {
  try {
    const product = await NewProduct.findAll({ where: { status: 'Active', approve_b: 'approved' } })
    return res.status(200).json({
      success: true,
      message: "All products of are fetched successfully",
      products: product
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

//Get products hsncode and taxpercentage
router.get('/api/getProductHsnAndTaxPercentage/:itemId', async function (req, res) {
  try {
    const product = await NewProduct.findOne({ where: { itemId: req.params.itemId, status: 'Active', approve_b: 'approved' } })
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    const tax = await TaxMaster.findOne({ where: { id: product.tax } })

    res.status(200).json({
      success: true,
      message: "Selected product HSN Code and Its Tax percentage is fetched successfully",
      hsnCode: product.hsnCode,
      taxPercentage: tax.Tax_percentage
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// create purchase order
router.post('/api/createPurchaseOrder', async (req, res) => {

  try {

    let getCode = await AutoGenerateNumber.findOne({ where: { prefix: "ST" } })

    // Increment the lastno value and pad it to 6 digits
    const newLastNo = (parseInt(getCode.lastNo) + 1).toString().padStart(6, '0');

    // Construct the unique identifier string
    const generateCode = `${getCode.prefix}/${newLastNo}/${getCode.suffix}`;

    // Update the lastno value in the database
    const updateGenerateCode = await AutoGenerateNumber.update(
      { lastNo: newLastNo },
      { where: { id: getCode.id } }
    );

    const {
      orderDate,
      outletId,
      supplierCustomer,
      name,
      email,
      mobileNo,
      paymentStatus,
      paymentMode,
      remarks,
      itemId,
      hsnCode,
      batchNo,
      mfgDate,
      expDate,
      qty,
      purchasePrice,
      mrp,
      salePriceInclTax,
      salePriceExclTax,
      taxPercentage,
      totalAmount,
      grandTotal
    } = req.body

    if (!req.body.outletId || !req.body.orderDate || !req.body.supplierCustomer || !req.body.paymentStatus || !req.body.paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Please provide order details correctly"
      })
    }

    if (!req.body.itemId || !req.body.hsnCode || !req.body.batchNo || !req.body.mfgDate || !req.body.expDate || !req.body.qty || !req.body.purchasePrice || !req.body.mrp || !req.body.salePriceInclTax || !req.body.taxPercentage || !req.body.salePriceExclTax || !req.body.totalAmount || !req.body.grandTotal) {
      return res.status(400).json({
        success: false,
        message: "Please provide product details correctly"
      })
    }

    // console.log(888888888,req.body)
    // Create an order with customer details
    const order = await Order.create({
      stockType: 'In',
      outletId: outletId,
      referenceNumber: generateCode,
      orderDate: orderDate,
      customerName: name,
      customerMobile: mobileNo,
      customerEmail: email,
      paymentStatus: paymentStatus,
      paymentMode: paymentMode,
      remarks: remarks,
      totalAmount: grandTotal
    });

    let products = []
    // Loop through the items (assuming itemId is a unique identifier for each product)
    for (let i = 0; i < itemId.length; i++) {

      // Calculate taxAmount based on the formula
      const calculatedTaxAmount = (salePriceInclTax[i] - salePriceInclTax[i] / (1 + 1 / taxPercentage[i])).toFixed(2);

      const product = {
        outletId: outletId,
        stockType: 'In',
        supplierCustomer: supplierCustomer,
        itemId: itemId[i],
        hsnCode: hsnCode[i],
        batchNo: batchNo[i],
        mfgDate: mfgDate[i],
        expDate: expDate[i],
        qty: qty[i],
        purchasePrice: purchasePrice[i],
        mrp: mrp[i],
        salePriceInclTax: salePriceInclTax[i],
        salePriceExclTax: salePriceExclTax[i],
        taxPercentage: taxPercentage[i],
        taxAmount: calculatedTaxAmount,
        totalAmount: totalAmount[i]
      };
      products.push(product);

    }

    // Create order items for each product
    const orderItems = products.map(product => ({
      orderFk: order.orderId,
      outletId: product.outletId,
      itemId: product.itemId,
      stockType: "In",
      supplierCustomer: product.supplierCustomer,
      hsnCode: product.hsnCode,
      batchNo: product.batchNo,
      mfgDate: product.mfgDate,
      expDate: product.expDate,
      freeQty: product.freeQty,
      qty: product.qty,
      purchasePrice: product.purchasePrice,
      discountType: product.discountType,
      discount: product.discount,
      originalPrice: product.originalPrice,
      mrp: product.mrp,
      salePriceInclTax: product.salePriceInclTax,
      salePriceExclTax: product.salePriceExclTax,
      costPriceWithoutTax: product.costPriceWithoutTax,
      taxPercentage: product.taxPercentage,
      taxAmount: product.taxAmount,
      packingType: product.packing,
      pack: product.pack,
      totalAmount: product.totalAmount
    }));
    // console.log(22222222222,orderItems)

    const stockIn = await ProductPrice.bulkCreate(orderItems)
    // console.log(stockIn)
    return res.status(200).json({
      success: true,
      message: "purchase order successfully created",
      order: order
    })

  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// get Update purchase order
router.get('/api/getUpdatePurchaseOrder/:id', async function (req, res) {
  try {
    const orderId = req.params.id
    const order = await Order.findOne({ where: { rowguid: orderId } })
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    const productsDetail = await ProductPrice.findAll({ where: { orderFk: order.orderId } })
    const previousStore = await Store.findOne({ where: { outletId: order.outletId, status: 'Active' } })
    const previousSupplier = await SupplierMaster.findOne({ where: { Email: order.customerEmail } })
    return res.status(200).json({
      success: true,
      message: "purchase order and its product details are successfully fetched",
      order: order,
      productsDetail: productsDetail,
      store: previousStore,
      supplier: previousSupplier
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
});

//get purchase order list
router.get('/api/getPurchaseOrderListData', async function (req, res) {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const outletId = req.query.outletId;
    const draw = parseInt(req.query.draw);
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;

    let where = {
      stockType: 'In',
      orderType: 'order',
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (outletId) {
      where.outletId = outletId;
    }

    if (searchValue) {
      where[Op.or] = [
        { orderId: { [Op.like]: `%${searchValue}%` } },
        { customerName: { [Op.like]: `%${searchValue}%` } },
        { totalAmount: { [Op.like]: `%${searchValue}%` } },
      ];
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: Store,
        },
      ],
      limit: length,
      offset: start,
    });

    const count = await Order.count({ where });

    const data_arr = orders.map((order) => ({
      storeName: order.store_master.storeName,
      orderId: order.orderId,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      rowguid: order.rowguid,
      approve_b: order.approve_b,
    }));

    const output = {
      draw,
      iTotalRecords: count,
      iTotalDisplayRecords: count,
      aaData: data_arr,
    };

    return res.status(200).json({
      success: true,
      message: "Purchase order details are fetched successfully",
      orders: output
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
});

//update purchase order
router.put('/api/updatePurchaseOrder/:id', async (req, res) => {
  try {

    // Existing product details
    const orderUpdate = await Order.findOne({ where: { rowguid: req.params.id } });
    if (!orderUpdate) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    const productPrice = await ProductPrice.findAll({ where: { orderFk: orderUpdate.orderId } });
    let pRowguid = []
    pRowguid = productPrice.map(mapping => mapping.rowguid)
    const {
      stockType,
      orderDate,
      outletId,
      supplierCustomer,
      name,
      email,
      mobileNo,
      paymentStatus,
      paymentMode,
      remarks,
      itemId,
      hsnCode,
      batchNo,
      mfgDate,
      expDate,
      qty,
      purchasePrice,
      mrp,
      salePriceInclTax,
      salePriceExclTax,
      taxPercentage,
      // taxAmount,
      totalAmount,
      grandTotal
    } = req.body
    // Add pRowguid to the req.body
    req.body.pRowguid = pRowguid;

    if (!req.body.outletId || !req.body.orderDate || !req.body.supplierCustomer || !req.body.paymentStatus || !req.body.paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Please provide order details correctly"
      })
    }

    if (!req.body.itemId || !req.body.hsnCode || !req.body.batchNo || !req.body.mfgDate || !req.body.expDate || !req.body.qty || !req.body.purchasePrice || !req.body.mrp || !req.body.salePriceInclTax || !req.body.taxPercentage || !req.body.salePriceExclTax || !req.body.totalAmount || !req.body.grandTotal) {
      return res.status(400).json({
        success: false,
        message: "Please provide product details correctly"
      })
    }

    // Create an order with customer details if needed
    const order = await orderUpdate.update(
      {
        stockType: "In",
        outletId: outletId,
        orderDate: orderDate,
        customerName: name,
        customerMobile: mobileNo,
        customerEmail: email,
        paymentStatus: paymentStatus,
        paymentMode: paymentMode,
        remarks: remarks,
        totalAmount: grandTotal,
        approve_b: 'pending'
      },
      { where: { rowguid: req.params.id } }
    );

    // Create an array to track which products are updated and which are new
    const updatedProducts = [];
    const newProducts = [];

    // Loop through the items (assuming itemId is a unique identifier for each product)
    for (let i = 0; i < itemId.length; i++) {
      // Calculate taxAmount based on the formula
      const calculatedTaxAmount = (salePriceInclTax[i] - salePriceInclTax[i] / (1 + 1 / taxPercentage[i])).toFixed(2);
      const product = {
        orderFk: orderUpdate.orderId,
        outletId: outletId,
        stockType: "In",
        supplierCustomer: supplierCustomer,
        itemId: itemId[i],
        hsnCode: hsnCode[i],
        batchNo: batchNo[i],
        mfgDate: mfgDate[i],
        expDate: expDate[i],
        qty: qty[i],
        purchasePrice: purchasePrice[i],
        mrp: mrp[i],
        salePriceInclTax: salePriceInclTax[i],
        salePriceExclTax: salePriceExclTax[i],
        taxPercentage: taxPercentage[i],
        taxAmount: calculatedTaxAmount,
        totalAmount: totalAmount[i],
        rowguid: pRowguid[i] || generateRowguid(),
        approve_b: 'pending'
      };

      // Check if the product already exists based on itemId and outletId
      const existingProduct = await ProductPrice.findOne({
        where: { rowguid: product.rowguid },
      });

      if (existingProduct) {
        // If it exists, update the existing record
        await existingProduct.update(product);
        updatedProducts.push(existingProduct);
      } else {
        // If it doesn't exist, create a new record
        const newProduct = await ProductPrice.create(product);
        newProducts.push(newProduct);
      }
    }
    // Function to generate a new rowguid
    function generateRowguid() {
      const uuid = require('uuid');
      return uuid.v4();
    }
    // Here, you can handle updatedProducts and newProducts as needed

    return res.status(200).json({
      success: true,
      message: 'Purchase order details Updated Successfully',
      updatedOrder: order
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
})


// Sales api

// populate the customer details into stockOut module
router.get('/api/getAllCustomer', async function (req, res) {
  try {
    const customers = await CustomerMaster.findAll({ where: { Status: 'Active' } })
    return res.status(200).json({
      success: true,
      message: "All customers are fetched successfully",
      customers: customers
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }
})


// populate the customer details into stockOut module
router.get('/api/getCustomerDetails/:customerId', async function (req, res) {
  try {
    const customerId = req.params.customerId
    const customer = await CustomerMaster.findOne({ where: { id: customerId, Status: 'Active' } })
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      })
    }
    res.status(200).json({
      success: true,
      message: "Customer details are successfully fetched",
      customer: customer
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }
})

//populate store based all products in stock out
router.get('/api/getStoreProducts/:outletId', async function (req, res) {
  try {
    const store = await Store.findOne({ where: { outletId: req.params.outletId } })
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      })
    }
    const allProducts = await StockInOut.findAll({ where: { outletId: req.params.outletId } })
    let products = []
    products = allProducts.map(mapping => mapping.itemId)
    storeAllProducts = await NewProduct.findAll({ where: { itemId: products, approve_b: 'approved' } })
    res.status(200).json({
      success: true,
      message: "Products are successfully fetched from selected store",
      storeProducts: storeAllProducts
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// batchNO based all products selected for stockLedger
router.get('/api/getAllBatchNo/:itemId/:outletId', async function (req, res) {
  try {
    const itemId = req.params.itemId
    const outletId = req.params.outletId
    const allBatchNo = await StockInOut.findAll({ where: { outletId: outletId, itemId: itemId, type: 'In' } })
    return res.status(200).json({
      success: true,
      message: "BatchNo of this selected product are successfully fetched from selected store",
      allBatchNo: allBatchNo
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// populate the product details into stockOut module
router.get('/api/getProductDetails/:itemId/:batchNo', async function (req, res) {
  try {
    const productDetails = await ProductPrice.findAll({ where: { itemId: req.params.itemId, batchNo: req.params.batchNo } })
    return res.status(200).json({
      success: true,
      message: "all details of selected product based on the selected batchNo",
      productDetails: productDetails
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// Quantity of stock from stock ledger
router.get('/api/getStockQuantity/:itemId/:batchNo', async (req, res) => {

  try {

    const itemId = req.params.itemId;
    const batchNO = req.params.batchNo;
    // Assuming you have a StockInOut model with your database schema
    const stockInQty = await StockInOut.sum('qty', {
      where: {
        itemId: itemId,
        batchNO: batchNO,
        type: 'In',
      },
    });

    const stockOutQty = await StockInOut.sum('qty', {
      where: {
        itemId: itemId,
        batchNO: batchNO,
        type: 'Out',
      },
    });

    const stockQuantity = (stockInQty || 0) - (stockOutQty || 0);

    return res.status(200).json({
      success: true,
      message: "Available stock qty is successfully fetched",
      stockIn: stockInQty || 0, // Ensure that 0 is returned when no records match the condition 
      stockOut: stockOutQty || 0,
      stockQuantity: stockQuantity,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
});

// create sales order
router.post('/api/createSalesOrder', async (req, res) => {

  try {

    let getCode = await AutoGenerateNumber.findOne({ where: { prefix: "INV" } })

    // Increment the lastno value and pad it to 6 digits
    const newLastNo = (parseInt(getCode.lastNo) + 1).toString().padStart(6, '0');

    // Construct the unique identifier string
    const generateCode = `${getCode.prefix}/${newLastNo}/${getCode.suffix}`;

    // Update the lastno value in the database
    const updateGenerateCode = await AutoGenerateNumber.update(
      { lastNo: newLastNo },
      { where: { id: getCode.id } }
    );

    const {
      orderDate,
      outletId,
      supplierCustomer,
      name,
      email,
      mobileNo,
      paymentStatus,
      paymentMode,
      remarks,
      itemId,
      // hsnCode,
      batchNo,
      // mfgDate,
      expDate,
      qty,
      // purchasePrice,
      // mrp,
      // salePriceInclTax,
      salePriceExclTax,
      discount,
      // taxPercentage,
      taxAmount,
      totalAmount,
      grandTotal
    } = req.body
    if (!req.body.outletId || !req.body.orderDate || !req.body.supplierCustomer || !req.body.paymentStatus || !req.body.paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Please provide order details correctly"
      })
    }

    if (!req.body.itemId || !req.body.batchNo || !req.body.expDate || !req.body.qty || !req.body.salePriceExclTax || !req.body.totalAmount || !req.body.grandTotal) {
      return res.status(400).json({
        success: false,
        message: "Please provide product details correctly"
      })
    }

    // console.log(888888888,req.body)
    // Create an order with customer details
    const order = await Order.create({
      stockType: 'Out',
      outletId: outletId,
      referenceNumber: generateCode,
      orderDate: orderDate,
      customerName: name,
      customerMobile: mobileNo,
      customerEmail: email,
      paymentStatus: paymentStatus,
      paymentMode: paymentMode,
      remarks: remarks,
      totalAmount: grandTotal
    });

    let products = []
    // Loop through the items (assuming itemId is a unique identifier for each product)
    for (let i = 0; i < itemId.length; i++) {
      const productPricedata = await ProductPrice.findOne({ where: { stockType: "In", outletId: outletId, itemId: itemId[i], batchNo: batchNo[i] } })

      const product = {
        outletId: outletId,
        stockType: 'Out',
        supplierCustomer: supplierCustomer,
        itemId: itemId[i],
        hsnCode: productPricedata.hsnCode,
        batchNo: batchNo[i],
        mfgDate: productPricedata.mfgDate,
        expDate: expDate[i],
        qty: qty[i],
        purchasePrice: productPricedata.purchasePrice,
        mrp: productPricedata.mrp,
        salePriceInclTax: productPricedata.salePriceInclTax,
        salePriceExclTax: salePriceExclTax[i],
        discount: discount[i],
        taxPercentage: productPricedata.taxPercentage,
        taxAmount: taxAmount[i],
        totalAmount: totalAmount[i]
      };
      products.push(product);

    }

    // Create order items for each product
    const orderItems = products.map(product => ({
      orderFk: order.orderId,
      outletId: product.outletId,
      itemId: product.itemId,
      stockType: 'Out',
      supplierCustomer: product.supplierCustomer,
      hsnCode: product.hsnCode,
      batchNo: product.batchNo,
      mfgDate: product.mfgDate,
      expDate: product.expDate,
      freeQty: product.freeQty,
      qty: product.qty,
      purchasePrice: product.purchasePrice,
      discountType: product.discountType,
      discount: product.discount,
      originalPrice: product.originalPrice,
      mrp: product.mrp,
      salePriceInclTax: product.salePriceInclTax,
      salePriceExclTax: product.salePriceExclTax,
      costPriceWithoutTax: product.costPriceWithoutTax,
      taxPercentage: product.taxPercentage,
      taxAmount: product.taxAmount,
      packingType: product.packing,
      pack: product.pack,
      totalAmount: product.totalAmount
    }));
    // console.log(22222222222,orderItems)

    const stockIn = await ProductPrice.bulkCreate(orderItems)
    // console.log(stockIn)
    return res.status(200).json({
      success: true,
      message: "Sales order successfully created",
      order: order
    })

  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// get sales order update page details
router.get('/api/getUpdateSalesOrder/:id', async function (req, res) {
  try {
    const orderId = req.params.id
    const order = await Order.findOne({ where: { rowguid: orderId } })
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
    const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
    const previousCustomer = await CustomerMaster.findOne({ where: { Email: order.customerEmail } })
    return res.status(200).json({
      success: true,
      message: "Sales order and its product details are fetched successfully",
      salesOrder: order,
      productDetails: productPrice,
      store: previousStore,
      customer: previousCustomer
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
});

//get sales order list
router.get('/api/getSalesOrderListData', async function (req, res) {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const outletId = req.query.outletId;
    const draw = parseInt(req.query.draw);
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;

    let where = {
      stockType: 'Out',
      orderType: 'order',
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (outletId) {
      where.outletId = outletId;
    }

    if (searchValue) {
      where[Op.or] = [
        { orderId: { [Op.like]: `%${searchValue}%` } },
        { customerName: { [Op.like]: `%${searchValue}%` } },
        { totalAmount: { [Op.like]: `%${searchValue}%` } },
      ];
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: Store,
        },
      ],
      limit: length,
      offset: start,
    });

    const count = await Order.count({ where });

    const data_arr = orders.map((order) => ({
      storeName: order.store_master.storeName,
      orderId: order.orderId,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      rowguid: order.rowguid,
      approve_b: order.approve_b,
    }));

    const output = {
      draw,
      iTotalRecords: count,
      iTotalDisplayRecords: count,
      aaData: data_arr,
    };

    res.status(200).json({
      success: true,
      message: "Sales order list data fetched successfully",
      orders: output
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
});

//update purchase order
router.put('/api/updateSalesOrder/:id', async (req, res) => {
  try {

    // Existing product details
    const orderUpdate = await Order.findOne({ where: { rowguid: req.params.id } });
    if (!orderUpdate) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    const productPrice = await ProductPrice.findAll({ where: { orderFk: orderUpdate.orderId } });
    let pRowguid = []
    pRowguid = productPrice.map(mapping => mapping.rowguid)
    const {
      orderDate,
      outletId,
      supplierCustomer,
      name,
      email,
      mobileNo,
      paymentStatus,
      paymentMode,
      remarks,
      itemId,
      batchNo,
      expDate,
      qty,
      salePriceExclTax,
      discount,
      taxAmount,
      totalAmount,
      grandTotal
    } = req.body
    // Add pRowguid to the req.body
    req.body.pRowguid = pRowguid;

    if (!req.body.outletId || !req.body.orderDate || !req.body.supplierCustomer || !req.body.paymentStatus || !req.body.paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Please provide order details correctly"
      })
    }

    if (!req.body.itemId || !req.body.batchNo || !req.body.expDate || !req.body.qty || !req.body.salePriceExclTax || !req.body.discount || !req.body.totalAmount || !req.body.grandTotal) {
      return res.status(400).json({
        success: false,
        message: "Please provide product details correctly"
      })
    }

    // Create an order with customer details if needed
    const order = await orderUpdate.update(
      {
        stockType: 'Out',
        outletId: outletId,
        orderDate: orderDate,
        customerName: name,
        customerMobile: mobileNo,
        customerEmail: email,
        paymentStatus: paymentStatus,
        paymentMode: paymentMode,
        remarks: remarks,
        totalAmount: grandTotal,
        approve_b: 'pending'
      },
      { where: { rowguid: req.params.id } }
    );

    // Create an array to track which products are updated and which are new
    const updatedProducts = [];
    const newProducts = [];

    // Loop through the items (assuming itemId is a unique identifier for each product)
    for (let i = 0; i < itemId.length; i++) {

      const productPricedata = await ProductPrice.findOne({ where: { stockType: "In", outletId: outletId, itemId: itemId[i], batchNo: batchNo[i] } })

      const product = {
        orderFk: orderUpdate.orderId,
        outletId: outletId,
        stockType: 'Out',
        supplierCustomer: supplierCustomer,
        itemId: itemId[i],
        hsnCode: productPricedata.hsnCode,
        batchNo: batchNo[i],
        mfgDate: productPricedata.mfgDate,
        expDate: expDate[i],
        qty: qty[i],
        purchasePrice: productPricedata.purchasePrice,
        mrp: productPricedata.mrp,
        salePriceInclTax: productPricedata.salePriceInclTax,
        salePriceExclTax: salePriceExclTax[i],
        discount: discount[i],
        taxPercentage: productPricedata.taxPercentage,
        taxAmount: taxAmount[i],
        totalAmount: totalAmount[i],
        rowguid: pRowguid[i] || generateRowguid(),
        approve_b: 'pending'
      };

      // Check if the product already exists based on itemId and outletId
      const existingProduct = await ProductPrice.findOne({
        where: { rowguid: product.rowguid },
      });

      if (existingProduct) {
        // If it exists, update the existing record
        await existingProduct.update(product);
        updatedProducts.push(existingProduct);
      } else {
        // If it doesn't exist, create a new record
        const newProduct = await ProductPrice.create(product);
        newProducts.push(newProduct);
      }
    }
    // Function to generate a new rowguid
    function generateRowguid() {
      const uuid = require('uuid');
      return uuid.v4();
    }
    // Here, you can handle updatedProducts and newProducts as needed

    return res.status(200).json({
      success: true,
      message: 'Sales order Updated Successfully',
      updatedOrder: order
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
})


// Opening stock api

router.post('/api/createOpeningStock', async (req, res) => {

  try {

    let getCode = await AutoGenerateNumber.findOne({ where: { prefix: "OPENSTE" } })

    // Increment the lastno value and pad it to 6 digits
    const newLastNo = (parseInt(getCode.lastNo) + 1).toString().padStart(6, '0');

    // Construct the unique identifier string
    const generateCode = `${getCode.prefix}/${newLastNo}/${getCode.suffix}`;

    // Update the lastno value in the database
    const updateGenerateCode = await AutoGenerateNumber.update(
      { lastNo: newLastNo },
      { where: { id: getCode.id } }
    );

    const {
      orderDate,
      outletId,
      // supplierCustomer,
      // name,
      // email,
      // mobileNo,
      // paymentStatus,
      // paymentMode,
      remarks,
      itemId,
      hsnCode,
      batchNo,
      mfgDate,
      expDate,
      qty,
      purchasePrice,
      mrp,
      salePriceInclTax,
      salePriceExclTax,
      taxPercentage,
      totalAmount,
      grandTotal
    } = req.body

    if (!req.body.outletId || !req.body.orderDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide order details correctly"
      })
    }

    if (!req.body.itemId || !req.body.hsnCode || !req.body.batchNo || !req.body.mfgDate || !req.body.expDate || !req.body.qty || !req.body.purchasePrice || !req.body.mrp || !req.body.salePriceInclTax || !req.body.taxPercentage || !req.body.salePriceExclTax || !req.body.totalAmount || !req.body.grandTotal) {
      return res.status(400).json({
        success: false,
        message: "Please provide product details correctly"
      })
    }

    // Create an order with customer details
    const order = await Order.create({
      stockType: 'In',
      outletId: outletId,
      orderType: "openingStock",
      referenceNumber: generateCode,
      orderDate: orderDate,
      customerName: "-1",
      customerMobile: "-1",
      customerEmail: "-1",
      paymentStatus: "-1",
      paymentMode: "-1",
      remarks: remarks,
      totalAmount: grandTotal
    });

    let products = []
    // Loop through the items (assuming itemId is a unique identifier for each product)
    for (let i = 0; i < itemId.length; i++) {

      // Calculate taxAmount based on the formula
      const calculatedTaxAmount = (salePriceInclTax[i] - salePriceInclTax[i] / (1 + 1 / taxPercentage[i])).toFixed(2);

      const product = {
        outletId: outletId,
        stockType: 'In',
        supplierCustomer: "-1",
        itemId: itemId[i],
        hsnCode: hsnCode[i],
        batchNo: batchNo[i],
        mfgDate: mfgDate[i],
        expDate: expDate[i],
        qty: qty[i],
        purchasePrice: purchasePrice[i],
        mrp: mrp[i],
        salePriceInclTax: salePriceInclTax[i],
        salePriceExclTax: salePriceExclTax[i],
        taxPercentage: taxPercentage[i],
        taxAmount: calculatedTaxAmount,
        totalAmount: totalAmount[i]
      };
      products.push(product);

    }

    // Create order items for each product
    const orderItems = products.map(product => ({
      orderFk: order.orderId,
      outletId: product.outletId,
      itemId: product.itemId,
      stockType: "In",
      supplierCustomer: product.supplierCustomer,
      hsnCode: product.hsnCode,
      batchNo: product.batchNo,
      mfgDate: product.mfgDate,
      expDate: product.expDate,
      freeQty: product.freeQty,
      qty: product.qty,
      purchasePrice: product.purchasePrice,
      discountType: product.discountType,
      discount: product.discount,
      originalPrice: product.originalPrice,
      mrp: product.mrp,
      salePriceInclTax: product.salePriceInclTax,
      salePriceExclTax: product.salePriceExclTax,
      costPriceWithoutTax: product.costPriceWithoutTax,
      taxPercentage: product.taxPercentage,
      taxAmount: product.taxAmount,
      packingType: product.packing,
      pack: product.pack,
      totalAmount: product.totalAmount
    }));

    const stockIn = await ProductPrice.bulkCreate(orderItems)
    // console.log(stockIn)
    return res.status(200).json({
      success: true,
      message: "Opening stock order successfully created",
      order: order
    })

  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// get Update opening stock order
router.get('/api/getUpdateOpeningStockOrder/:id', async function (req, res) {
  try {
    const orderId = req.params.id
    const order = await Order.findOne({ where: { rowguid: orderId } })
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    const productsDetail = await ProductPrice.findAll({ where: { orderFk: order.orderId } })
    const previousStore = await Store.findOne({ where: { outletId: order.outletId, status: 'Active' } })
    return res.status(200).json({
      success: true,
      message: "Openong Stock order and its product details are successfully fetched",
      order: order,
      productsDetail: productsDetail,
      store: previousStore,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
});

//update opening stock order
router.put('/api/updateOpeningStockOrder/:id', async (req, res) => {
  try {

    // Existing product details
    const orderUpdate = await Order.findOne({ where: { rowguid: req.params.id } });
    if (!orderUpdate) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    const productPrice = await ProductPrice.findAll({ where: { orderFk: orderUpdate.orderId } });
    let pRowguid = []
    pRowguid = productPrice.map(mapping => mapping.rowguid)
    const {
      orderDate,
      outletId,
      remarks,
      itemId,
      hsnCode,
      batchNo,
      mfgDate,
      expDate,
      qty,
      purchasePrice,
      mrp,
      salePriceInclTax,
      salePriceExclTax,
      taxPercentage,
      // taxAmount,
      totalAmount,
      grandTotal
    } = req.body
    // Add pRowguid to the req.body
    req.body.pRowguid = pRowguid;

    if (!req.body.outletId || !req.body.orderDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide order details correctly"
      })
    }

    if (!req.body.itemId || !req.body.hsnCode || !req.body.batchNo || !req.body.mfgDate || !req.body.expDate || !req.body.qty || !req.body.purchasePrice || !req.body.mrp || !req.body.salePriceInclTax || !req.body.taxPercentage || !req.body.salePriceExclTax || !req.body.totalAmount || !req.body.grandTotal) {
      return res.status(400).json({
        success: false,
        message: "Please provide product details correctly"
      })
    }

    // Create an order with customer details if needed
    const order = await orderUpdate.update(
      {
        stockType: "In",
        orderType: "openingStock",
        outletId: outletId,
        orderDate: orderDate,
        customerName: "-1",
        customerMobile: "-1",
        customerEmail: "-1",
        paymentStatus: "-1",
        paymentMode: "-1",
        remarks: remarks,
        totalAmount: grandTotal,
        approve_b: 'pending'
      },
      { where: { rowguid: req.params.id } }
    );

    // Create an array to track which products are updated and which are new
    const updatedProducts = [];
    const newProducts = [];

    // Loop through the items (assuming itemId is a unique identifier for each product)
    for (let i = 0; i < itemId.length; i++) {
      // Calculate taxAmount based on the formula
      const calculatedTaxAmount = (salePriceInclTax[i] - salePriceInclTax[i] / (1 + 1 / taxPercentage[i])).toFixed(2);
      const product = {
        orderFk: orderUpdate.orderId,
        outletId: outletId,
        stockType: "In",
        supplierCustomer: "-1",
        itemId: itemId[i],
        hsnCode: hsnCode[i],
        batchNo: batchNo[i],
        mfgDate: mfgDate[i],
        expDate: expDate[i],
        qty: qty[i],
        purchasePrice: purchasePrice[i],
        mrp: mrp[i],
        salePriceInclTax: salePriceInclTax[i],
        salePriceExclTax: salePriceExclTax[i],
        taxPercentage: taxPercentage[i],
        taxAmount: calculatedTaxAmount,
        totalAmount: totalAmount[i],
        rowguid: pRowguid[i] || generateRowguid(),
        approve_b: 'pending'
      };

      // Check if the product already exists based on itemId and outletId
      const existingProduct = await ProductPrice.findOne({
        where: { rowguid: product.rowguid },
      });

      if (existingProduct) {
        // If it exists, update the existing record
        await existingProduct.update(product);
        updatedProducts.push(existingProduct);
      } else {
        // If it doesn't exist, create a new record
        const newProduct = await ProductPrice.create(product);
        newProducts.push(newProduct);
      }
    }
    // Function to generate a new rowguid
    function generateRowguid() {
      const uuid = require('uuid');
      return uuid.v4();
    }
    // Here, you can handle updatedProducts and newProducts as needed

    return res.status(200).json({
      success: true,
      message: 'Opening Stock order details Updated Successfully',
      updatedOrder: order
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
})

//get purchase order list
router.get('/api/getOpeningStockOrderListData', async function (req, res) {
  try {
    // const startDate = req.query.startDate;
    // const endDate = req.query.endDate;
    // const outletId = req.query.outletId;
    const draw = parseInt(req.query.draw);
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;

    let where = {
      stockType: 'In',
      orderType: 'openingStock',
    };

    // if (startDate && endDate) {
    //   where.createdAt = {
    //     [Op.between]: [startDate, endDate],
    //   };
    // }

    if (outletId) {
      where.outletId = outletId;
    }

    if (searchValue) {
      where[Op.or] = [
        { orderId: { [Op.like]: `%${searchValue}%` } },
        // { customerName: { [Op.like]: `%${searchValue}%` } },
        { totalAmount: { [Op.like]: `%${searchValue}%` } },
      ];
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: Store,
        },
      ],
      limit: length,
      offset: start,
    });

    const count = await Order.count({ where });

    const data_arr = orders.map((order) => ({
      storeName: order.store_master.storeName,
      orderId: order.orderId,
      // customerName: order.customerName,
      totalAmount: order.totalAmount,
      rowguid: order.rowguid,
      approve_b: order.approve_b,
    }));

    const output = {
      draw,
      iTotalRecords: count,
      iTotalDisplayRecords: count,
      aaData: data_arr,
    };

    return res.status(200).json({
      success: true,
      message: "Opening stock order details are fetched successfully",
      orders: output
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
});




// Product damage api

// create product damage order
router.post('/api/createProductDamageOrder', async (req, res) => {

  try {

    let getCode = await AutoGenerateNumber.findOne({ where: { prefix: "PRODDMG" } })

    // Increment the lastno value and pad it to 6 digits
    const newLastNo = (parseInt(getCode.lastNo) + 1).toString().padStart(6, '0');

    // Construct the unique identifier string
    const generateCode = `${getCode.prefix}/${newLastNo}/${getCode.suffix}`;

    // Update the lastno value in the database
    const updateGenerateCode = await AutoGenerateNumber.update(
      { lastNo: newLastNo },
      { where: { id: getCode.id } }
    );

    const {
      orderDate,
      outletId,
      // supplierCustomer,
      // name,
      // email,
      // mobileNo,
      // paymentStatus,
      // paymentMode,
      remarks,
      itemId,
      // hsnCode,
      batchNo,
      // mfgDate,
      expDate,
      qty,
      // purchasePrice,
      // mrp,
      // salePriceInclTax,
      salePriceExclTax,
      discount,
      // taxPercentage,
      taxAmount,
      totalAmount,
      grandTotal
    } = req.body
    if (!req.body.outletId || !req.body.orderDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide order details correctly"
      })
    }

    if (!req.body.itemId || !req.body.batchNo || !req.body.expDate || !req.body.qty || !req.body.salePriceExclTax || !req.body.discount || !req.body.totalAmount || !req.body.grandTotal) {
      return res.status(400).json({
        success: false,
        message: "Please provide product details correctly"
      })
    }

    // console.log(888888888,req.body)
    // Create an order with customer details
    const order = await Order.create({
      stockType: 'Out',
      orderType: "damage",
      outletId: outletId,
      referenceNumber: generateCode,
      orderDate: orderDate,
      customerName: "-1",
      customerMobile: "-1",
      customerEmail: "-1",
      paymentStatus: "-1",
      paymentMode: "-1",
      remarks: remarks,
      totalAmount: grandTotal
    });

    let products = []
    // Loop through the items (assuming itemId is a unique identifier for each product)
    for (let i = 0; i < itemId.length; i++) {
      const productPricedata = await ProductPrice.findOne({ where: { stockType: "In", outletId: outletId, itemId: itemId[i], batchNo: batchNo[i] } })

      const product = {
        outletId: outletId,
        stockType: 'Out',
        supplierCustomer: "-1",
        itemId: itemId[i],
        hsnCode: productPricedata.hsnCode,
        batchNo: batchNo[i],
        mfgDate: productPricedata.mfgDate,
        expDate: expDate[i],
        qty: qty[i],
        purchasePrice: productPricedata.purchasePrice,
        mrp: productPricedata.mrp,
        salePriceInclTax: productPricedata.salePriceInclTax,
        salePriceExclTax: salePriceExclTax[i],
        discount: discount[i],
        taxPercentage: productPricedata.taxPercentage,
        taxAmount: taxAmount[i],
        totalAmount: totalAmount[i]
      };
      products.push(product);

    }

    // Create order items for each product
    const orderItems = products.map(product => ({
      orderFk: order.orderId,
      outletId: product.outletId,
      itemId: product.itemId,
      stockType: 'Out',
      supplierCustomer: product.supplierCustomer,
      hsnCode: product.hsnCode,
      batchNo: product.batchNo,
      mfgDate: product.mfgDate,
      expDate: product.expDate,
      freeQty: product.freeQty,
      qty: product.qty,
      purchasePrice: product.purchasePrice,
      discountType: product.discountType,
      discount: product.discount,
      originalPrice: product.originalPrice,
      mrp: product.mrp,
      salePriceInclTax: product.salePriceInclTax,
      salePriceExclTax: product.salePriceExclTax,
      costPriceWithoutTax: product.costPriceWithoutTax,
      taxPercentage: product.taxPercentage,
      taxAmount: product.taxAmount,
      packingType: product.packing,
      pack: product.pack,
      totalAmount: product.totalAmount
    }));
    // console.log(22222222222,orderItems)

    const stockIn = await ProductPrice.bulkCreate(orderItems)
    // console.log(stockIn)
    return res.status(200).json({
      success: true,
      message: "Product Damage order successfully created",
      order: order
    })

  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// get ProductDamage order update page details
router.get('/api/getUpdateProductDamageOrder/:id', async function (req, res) {
  try {
    const orderId = req.params.id
    const order = await Order.findOne({ where: { rowguid: orderId } })
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
    const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
    return res.status(200).json({
      success: true,
      message: "Product Damage order and its product details are fetched successfully",
      salesOrder: order,
      productDetails: productPrice,
      store: previousStore,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
});

//get ProductDamage order list
router.get('/api/getProductDamageOrderListData', async function (req, res) {
  try {
    // const startDate = req.query.startDate;
    // const endDate = req.query.endDate;
    // const outletId = req.query.outletId;
    const draw = parseInt(req.query.draw);
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const searchValue = req.query.search.value;

    let where = {
      stockType: 'Out',
      orderType: 'damage',
    };

    // if (startDate && endDate) {
    //   where.createdAt = {
    //     [Op.between]: [startDate, endDate],
    //   };
    // }

    // if (outletId) {
    //   where.outletId = outletId;
    // }

    if (searchValue) {
      where[Op.or] = [
        { orderId: { [Op.like]: `%${searchValue}%` } },
        // { customerName: { [Op.like]: `%${searchValue}%` } },
        { totalAmount: { [Op.like]: `%${searchValue}%` } },
      ];
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: Store,
        },
      ],
      limit: length,
      offset: start,
    });

    const count = await Order.count({ where });

    const data_arr = orders.map((order) => ({
      storeName: order.store_master.storeName,
      orderId: order.orderId,
      // customerName: order.customerName,
      totalAmount: order.totalAmount,
      rowguid: order.rowguid,
      approve_b: order.approve_b,
    }));

    const output = {
      draw,
      iTotalRecords: count,
      iTotalDisplayRecords: count,
      aaData: data_arr,
    };

    res.status(200).json({
      success: true,
      message: "Product Damage order list data fetched successfully",
      orders: output
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
});

//update ProductDamage order
router.put('/api/updateProductDamageOrder/:id', async (req, res) => {
  try {

    // Existing product details
    const orderUpdate = await Order.findOne({ where: { rowguid: req.params.id } });
    if (!orderUpdate) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    const productPrice = await ProductPrice.findAll({ where: { orderFk: orderUpdate.orderId } });
    let pRowguid = []
    pRowguid = productPrice.map(mapping => mapping.rowguid)
    const {
      orderDate,
      outletId,
      // supplierCustomer,
      // name,
      // email,
      // mobileNo,
      // paymentStatus,
      // paymentMode,
      remarks,
      itemId,
      batchNo,
      expDate,
      qty,
      salePriceExclTax,
      discount,
      taxAmount,
      totalAmount,
      grandTotal
    } = req.body
    // Add pRowguid to the req.body
    req.body.pRowguid = pRowguid;

    if (!req.body.outletId || !req.body.orderDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide order details correctly"
      })
    }

    if (!req.body.itemId || !req.body.batchNo || !req.body.expDate || !req.body.qty || !req.body.salePriceExclTax || !req.body.discount || !req.body.totalAmount || !req.body.grandTotal) {
      return res.status(400).json({
        success: false,
        message: "Please provide product details correctly"
      })
    }

    // Create an order with customer details if needed
    const order = await orderUpdate.update(
      {
        stockType: 'Out',
        orderType: "damage",
        outletId: outletId,
        orderDate: orderDate,
        customerName: "-1",
        customerMobile: "-1",
        customerEmail: "-1",
        paymentStatus: "-1",
        paymentMode: "-1",
        remarks: remarks,
        totalAmount: grandTotal,
        approve_b: 'pending'
      },
      { where: { rowguid: req.params.id } }
    );



    // Create an array to track which products are updated and which are new
    const updatedProducts = [];
    const newProducts = [];

    // Loop through the items (assuming itemId is a unique identifier for each product)
    for (let i = 0; i < itemId.length; i++) {

      const productPricedata = await ProductPrice.findOne({ where: { stockType: "In", outletId: outletId, itemId: itemId[i], batchNo: batchNo[i] } })

      const product = {
        orderFk: orderUpdate.orderId,
        outletId: outletId,
        stockType: 'Out',
        supplierCustomer: "-1",
        itemId: itemId[i],
        hsnCode: productPricedata.hsnCode,
        batchNo: batchNo[i],
        mfgDate: productPricedata.mfgDate,
        expDate: expDate[i],
        qty: qty[i],
        purchasePrice: productPricedata.purchasePrice,
        mrp: productPricedata.mrp,
        salePriceInclTax: productPricedata.salePriceInclTax,
        salePriceExclTax: salePriceExclTax[i],
        discount: discount[i],
        taxPercentage: productPricedata.taxPercentage,
        taxAmount: taxAmount[i],
        totalAmount: totalAmount[i],
        rowguid: pRowguid[i] || generateRowguid(),
        approve_b: 'pending'
      };

      // Check if the product already exists based on itemId and outletId
      const existingProduct = await ProductPrice.findOne({
        where: { rowguid: product.rowguid },
      });

      if (existingProduct) {
        // If it exists, update the existing record
        await existingProduct.update(product);
        updatedProducts.push(existingProduct);
      } else {
        // If it doesn't exist, create a new record
        const newProduct = await ProductPrice.create(product);
        newProducts.push(newProduct);
      }
    }
    // Function to generate a new rowguid
    function generateRowguid() {
      const uuid = require('uuid');
      return uuid.v4();
    }
    // Here, you can handle updatedProducts and newProducts as needed

    return res.status(200).json({
      success: true,
      message: 'Product Damage order Updated Successfully',
      updatedOrder: order
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
})





// Approvals Api

//Product approval

//Product approval access 
router.get('/api/getProductApprovalPageAccess/:userId', async function (req, res) {
  try {
    const userId = req.params.userId

    const user = await User.findOne({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const storeMapping = await UserStoreMapping.findOne({ where: { userFk: userId } })
    // if(!storeMapping){
    //   return res.status(400).json({
    //     success : false,
    //     message : "This user has no link to any store"
    //   })
    // }
    const store = await Store.findOne({ where: { outletId: storeMapping.storeFk } })
    if (!store) {
      return res.status(400).json({
        success: false,
        message: "User is not linked to any Store"
      })
    }
    if (user.managerFk !== -1 && store.storeName !== 'Head Office') {
      return res.status(400).json({
        success: false,
        message: "You can not access this page only super admin and Head Office users can access this page"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Yes you can access this page"
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: true,
      message: "Something went wrong"
    })
  }

});

//Get Product approval data
router.get('/api/getProductApprovalData', async (req, res) => {
  try {
    let draw = req.query.draw;
    let start = parseInt(req.query.start);
    let length = parseInt(req.query.length);
    let approvalStatus = req.query.approvalStatus;

    let where = {};

    if (req.query.search && req.query.search.value) {
      where[Op.or] = [
        { itemName: { [Op.like]: `%${req.query.search.value}%` } },
        { approve_b: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const products = await NewProduct.findAll({
      where: { ...where, approve_b: approvalStatus },
      limit: length,
      offset: start,
    });

    const count = await NewProduct.count({ where: { approve_b: approvalStatus } });

    let data_arr = products.map((product) => ({
      itemName: product.itemName,
      status: product.approve_b,
      itemId: product.itemId,
      rowguid: product.rowguid,
    }));

    let output = {
      success: true,
      message: `${approvalStatus} Products are fetched successfully`,
      data: {
        totalRecords: count,
        products: data_arr,
      },
    };

    return res.status(200).json(output);
  } catch (error) {
    console.log(error);
    let output = {
      success: false,
      message: 'Something went wrong',
    };
    res.status(500).json(output);
  }
});

//Update status of selected products
router.post('/api/updateStatusOfProductApproval', async (req, res) => {

  const { products, action } = req.body;

  if (action === 'approved' || action === 'rejected') {
    try {
      for (const itemId of products) {

        const product = await NewProduct.findOne({ where: { rowguid: itemId } });

        if (product) {
          await NewProduct.update({ approve_b: action }, { where: { rowguid: itemId } });
        }

      }
      return res.status(200).json({
        success: true,
        message: `selected products are ${action}`
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Something went wrong"
      })
    }
  }
})


// Purchase Approval List

// router.get('/newStockInApprovalList', checkUser, stockInOutController.newStockInApprovalList);

router.get('/api/getPurchaseApprovalData', async (req, res) => {
  try {
    let draw = req.query.draw;
    let start = parseInt(req.query.start);
    let length = parseInt(req.query.length);
    let approvalStatus = req.query.approvalStatus;

    let where = {};

    if (req.query.search && req.query.search.value) {
      where[Op.or] = [
        { referenceNumber: { [Op.like]: `%${req.query.search.value}%` } },
        { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
        { customerName: { [Op.like]: `%${req.query.search.value}%` } },
        { orderDate: { [Op.like]: `%${req.query.search.value}%` } },
        { totalAmount: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const orders = await Order.findAll({
      where: { ...where, orderType: 'order', stockType: 'In', approve_b: approvalStatus },
      limit: length,
      offset: start,
      include: [{
        model: Store
      }]
    });

    const count = await Order.count({ where: { orderType: 'order', stockType: 'In', approve_b: approvalStatus } });

    let data_arr = orders.map((order) => ({
      referenceNumber: order.referenceNumber,
      storeName: order.store_master.storeName,
      customerName: order.customerName,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      status: order.approve_b,
      orderId: order.orderId
    }));

    let output = {
      success: true,
      message: 'Purchase orders approval data fetched successfully',
      data: {
        draw: draw,
        totalRecords: count,
        purchaseOrders: data_arr,
      },
    };

    return res.status(200).json(output);
  } catch (error) {
    console.log(error);
    let output = {
      success: false,
      message: 'Something went wrong',
    };
    return res.status(500).json(output);
  }
});

router.post('/api/updateStatusOfPurchaseOrderApproval/:userId', async (req, res) => {

  const { orders, action } = req.body;

  if (action === 'approved' || action === 'rejected') {
    try {
      for (const orderId of orders) {
        await processApproval(orderId, action);
      }
      return res.status(200).json({
        success: true,
        message: `All selected purchase orders are ${action}`
      })
    } catch (err) {
      console.log(err);
      return res.status(200).json({
        success: false,
        message: "Something went wrong"
      })
    }
  }

  async function processApproval(orderId, action) {
    const order = await Order.findOne({ where: { orderId: orderId } });
    const userId = req.params.userId

    if (order) {
      await Order.update({ approve_b: action }, { where: { orderId: orderId } });

      const productPrices = await ProductPrice.findAll({ where: { orderFk: orderId } });

      for (const stockInOut of productPrices) {
        await StockInOut.create({
          productPriceFk: stockInOut.orderFk,
          itemId: stockInOut.itemId,
          outletId: stockInOut.outletId,
          type: stockInOut.stockType,
          purchasePrice: stockInOut.purchasePrice,
          salePriceExclTax: stockInOut.salePriceExclTax,
          salePriceInclTax: stockInOut.salePriceInclTax,
          qty: stockInOut.qty,
          remarks: order.remarks,
          batchNo: stockInOut.batchNo,
          expDate: stockInOut.expDate,
          productHsnCode: stockInOut.hsnCode,
          created_by: userId
        }, {
          where: {
            itemId: stockInOut.itemId,
            outletId: stockInOut.outletId,
            batchNo: stockInOut.batchNo
          },
        });
      }
    }
  }
})


//Sales Approval List

// router.get('/api/getSalesApprovalData', checkUser, stockInOutController.newStockOutApprovalList);

router.get('/api/getSalesApprovalData', async (req, res) => {
  try {
    let draw = req.query.draw;
    let start = parseInt(req.query.start);
    let length = parseInt(req.query.length);
    let approvalStatus = req.query.approvalStatus;

    let where = {};

    if (req.query.search && req.query.search.value) {
      where[Op.or] = [
        { referenceNumber: { [Op.like]: `%${req.query.search.value}%` } },
        { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
        { customerName: { [Op.like]: `%${req.query.search.value}%` } },
        { orderDate: { [Op.like]: `%${req.query.search.value}%` } },
        { totalAmount: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const orders = await Order.findAll({
      where: { ...where, orderType: 'order', stockType: 'Out', approve_b: approvalStatus },
      limit: length,
      offset: start,
      include: [{
        model: Store
      }]
    });

    const count = await Order.count({ where: { orderType: 'order', stockType: 'Out', approve_b: approvalStatus } });

    let data_arr = orders.map((order) => ({
      referenceNumber: order.referenceNumber,
      storeName: order.store_master.storeName,
      customerName: order.customerName,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      status: order.approve_b,
      orderId: order.orderId
    }));

    let output = {
      success: true,
      message: `Sales orders data fetched successfully`,
      data: {
        draw: draw,
        totalRecords: count,
        salesOrders: data_arr,
      },
    };

    return res.status(200).json(output);
  } catch (error) {
    console.log(error);
    let output = {
      success: false,
      message: 'Something went wrong',
    };
    return res.status(500).json(output);
  }
});

router.post('/api/updateStatusOfSalesOrderApproval/:userId', async (req, res) => {

  const { orders, action } = req.body;

  if (action === 'approved' || action === 'rejected') {
    try {
      for (const orderId of orders) {
        await processApproval(orderId, action);
      }
      return res.status(200).json({
        success: true,
        message: `All selected orders are ${action}`
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: 'Something went wrong'
      })
    }
  }

  async function processApproval(orderId, action) {
    const order = await Order.findOne({ where: { orderId: orderId } });
    const userId = req.params.userId

    if (order) {
      await Order.update({ approve_b: action }, { where: { orderId: orderId } });

      const productPrices = await ProductPrice.findAll({ where: { orderFk: orderId } });

      for (const stockInOut of productPrices) {
        await StockInOut.create({
          productPriceFk: stockInOut.orderFk,
          itemId: stockInOut.itemId,
          outletId: stockInOut.outletId,
          type: stockInOut.stockType,
          purchasePrice: stockInOut.purchasePrice,
          salePriceExclTax: stockInOut.salePriceExclTax,
          salePriceInclTax: stockInOut.salePriceInclTax,
          qty: stockInOut.qty,
          remarks: order.remarks,
          batchNo: stockInOut.batchNo,
          expDate: stockInOut.expDate,
          productHsnCode: stockInOut.hsnCode,
          created_by: userId
        }, {
          where: {
            itemId: stockInOut.itemId,
            outletId: stockInOut.outletId,
            batchNo: stockInOut.batchNo
          },
        });
      }
    }
  }
})


// Opening Stock Approval List

// router.get('/newOpeningStockApprovalList', checkUser, stockInOutController.newOpeningStockApprovalList);

router.get('/api/getOpeningStockApprovalData', async (req, res) => {
  try {
    let draw = req.query.draw;
    let start = parseInt(req.query.start);
    let length = parseInt(req.query.length);
    let approvalStatus = req.query.approvalStatus;

    let where = {};

    if (req.query.search && req.query.search.value) {
      where[Op.or] = [
        { referenceNumber: { [Op.like]: `%${req.query.search.value}%` } },
        { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
        { customerName: { [Op.like]: `%${req.query.search.value}%` } },
        { orderDate: { [Op.like]: `%${req.query.search.value}%` } },
        { totalAmount: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const orders = await Order.findAll({
      where: { ...where, orderType: 'openingStock', approve_b: approvalStatus },
      limit: length,
      offset: start,
      include: [{
        model: Store
      }]
    });

    const count = await Order.count({ where: { orderType: 'openingStock', approve_b: approvalStatus } });

    let data_arr = orders.map((order) => ({
      referenceNumber: order.referenceNumber,
      storeName: order.store_master.storeName,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      status: order.approve_b,
      orderId: order.orderId
    }));

    let output = {
      success: true,
      message: 'Opening stock orders fetched successfully',
      data: {
        totalRecords: count,
        openingStockOrders: data_arr,
      },
    };

    return res.status(200).json(output);
  } catch (error) {
    console.log(error);
    let output = {
      success: false,
      message: 'Something went wrong',
    };
    return res.status(500).json(output);
  }
});


router.post('/api/updateStatusOfOpeningStockApproval/:userId', async (req, res) => {

  const { orders, action } = req.body;

  // let flashMessages = [];

  if (action === 'approved' || action === 'rejected') {
    try {
      for (const orderId of orders) {
        await processApproval(orderId, action);
      }
      return res.status(200).json({
        success: true,
        message: `All selected orders are ${action}`
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Something went wrong"
      })
    }
  }

  async function processApproval(orderId, action) {
    const order = await Order.findOne({ where: { orderId: orderId } });
    const userId = req.session.userDetail.id

    if (order) {
      await Order.update({ approve_b: action }, { where: { orderId: orderId } });

      const productPrices = await ProductPrice.findAll({ where: { orderFk: orderId } });

      for (const stockInOut of productPrices) {
        await StockInOut.create({
          productPriceFk: stockInOut.orderFk,
          itemId: stockInOut.itemId,
          outletId: stockInOut.outletId,
          type: stockInOut.stockType,
          purchasePrice: stockInOut.purchasePrice,
          salePriceExclTax: stockInOut.salePriceExclTax,
          salePriceInclTax: stockInOut.salePriceInclTax,
          qty: stockInOut.qty,
          remarks: order.remarks,
          batchNo: stockInOut.batchNo,
          expDate: stockInOut.expDate,
          productHsnCode: stockInOut.hsnCode,
          created_by: userId
        }, {
          where: {
            itemId: stockInOut.itemId,
            outletId: stockInOut.outletId,
            batchNo: stockInOut.batchNo
          },
        });
      }
    }
  }
})


//Product damage Approval List

router.get('/api/getProductDamageApprovalData', async (req, res) => {
  try {
    let draw = req.query.draw;
    let start = parseInt(req.query.start);
    let length = parseInt(req.query.length);
    let approvalStatus = req.query.approvalStatus;

    let where = {};

    if (req.query.search && req.query.search.value) {
      where[Op.or] = [
        { referenceNumber: { [Op.like]: `%${req.query.search.value}%` } },
        { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
        { customerName: { [Op.like]: `%${req.query.search.value}%` } },
        { orderDate: { [Op.like]: `%${req.query.search.value}%` } },
        { totalAmount: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const orders = await Order.findAll({
      where: { ...where, orderType: 'damage', approve_b: approvalStatus },
      limit: length,
      offset: start,
      include: [{
        model: Store
      }]
    });

    const count = await Order.count({ where: { orderType: 'damage', approve_b: approvalStatus } });

    let data_arr = orders.map((order) => ({
      referenceNumber: order.referenceNumber,
      storeName: order.store_master.storeName,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      status: order.approve_b,
      orderId: order.orderId
    }));

    let output = {
      success: true,
      message: 'Product Damage orders approval data fetched successfully',
      data: {
        draw: draw,
        totalRecords: count,
        damageOrders: data_arr,
      },
    };

    return res.status(200).json(output);
  } catch (error) {
    console.log(error);
    let output = {
      success: false,
      message: 'Something went wrong',
    };
    return res.status(500).json(output);
  }
});


router.post('/api/updateStatusOfProductDamageApproval/:userId', async (req, res) => {

  const { orders, action } = req.body;

  if (action === 'approved' || action === 'rejected') {
    try {
      for (const orderId of orders) {
        await processApproval(orderId, action);
      }
      return res.status(200).json({
        success: true,
        message: `All selected orders are ${action}`
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Something went wrong"
      })
    }
  }

  async function processApproval(orderId, action) {
    const order = await Order.findOne({ where: { orderId: orderId } });
    const userId = req.session.userDetail.id

    if (order) {
      await Order.update({ approve_b: action }, { where: { orderId: orderId } });

      const productPrices = await ProductPrice.findAll({ where: { orderFk: orderId } });

      for (const stockInOut of productPrices) {
        await StockInOut.create({
          productPriceFk: stockInOut.orderFk,
          itemId: stockInOut.itemId,
          outletId: stockInOut.outletId,
          type: stockInOut.stockType,
          purchasePrice: stockInOut.purchasePrice,
          salePriceExclTax: stockInOut.salePriceExclTax,
          salePriceInclTax: stockInOut.salePriceInclTax,
          qty: stockInOut.qty,
          remarks: order.remarks,
          batchNo: stockInOut.batchNo,
          expDate: stockInOut.expDate,
          productHsnCode: stockInOut.hsnCode,
          created_by: userId
        }, {
          where: {
            itemId: stockInOut.itemId,
            outletId: stockInOut.outletId,
            batchNo: stockInOut.batchNo
          },
        });
      }
    }
  }
})


// Brand Api

router.post('/api/addBrand', async (req, res) => {

  try {

    let info = {
      manufacturerId,
      shortDescription,
      longDescription,
      status,
      approve_b,
      approve_by,
      approve_date
    } = req.body

    if (!req.body.shortDescription) {
      return res.status(400).json({
        success: false,
        message: 'Brand name field can not be blank',
      });
    }

    const manufacturer = await Manufacturer.create(info)

    return res.status(200).json({
      success: true,
      message: 'Brand added Successfully',
      Brand: manufacturer
    });
  }

  catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}
)

router.get('/api/getBrandListData', async function (req, res) {

  try {
    let draw = req.query.draw;

    let start = parseInt(req.query.start);

    let length = parseInt(req.query.length);

    let where = {}


    if (req.query.search.value) {
      where[Op.or] = [
        { shortDescription: { [Op.like]: `%${req.query.search.value}%` } },
        { longDescription: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const manufacturer = await Manufacturer.findAll({
      where: {
        ...where, // Your initial where conditions, I assume
        approve_b: ["approved", "pending"]
      },
      limit: length,
      offset: start
    });

    const count = await Manufacturer.count()

    let data_arr = []
    for (let i = 0; i < manufacturer.length; i++) {
      data_arr.push({
        'manufacturerId': manufacturer[i].manufacturerId,
        'shortDescription': manufacturer[i].shortDescription,
        'longDescription': manufacturer[i].longDescription
      });
    }
    let output = {
      'draw': draw,
      'iTotalRecords': count,
      'iTotalDisplayRecords': count,
      'aaData': data_arr
    };

    return res.status(200).json({
      success: true,
      message: "Brand list data fetched successfully",
      brand: output
    })
  } catch {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

router.get('/api/getUpdateBrand/:id', async function (req, res) {

  try {
    const brand = await Manufacturer.findOne({ where: { manufacturerId: req.params.id } })

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Brand data fetched successfully',
      Brand: brand
    });
  }

  catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
});

router.put('/api/updateBrand/:id', async (req, res) => {

  try {

    const brand = await Manufacturer.findOne({ where: { manufacturerId: req.params.id } })

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }
    if (!req.body.shortDescription) {
      return res.status(400).json({
        success: false,
        message: 'Brand name field can not be blank',
      });
    }

    const manufacturer = await brand.update({ ...req.body, approve_b: 'pending' }, { where: { manufacturerId: req.params.id } })
    return res.status(200).json({
      success: true,
      message: 'Brand Updated successfully',
      brand: manufacturer
    });

  } catch (err) {
    console.log(err.message)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
})


// Category Api

router.post('/api/addCategory', async (req, res) => {
  try {
    const { code_name, displayorder, Active } = req.body;

    if (!req.body.code_name) {
      return res.status(400).json({
        success: false,
        message: "Category field can not be blank"
      })
    }

    // Create a new category
    const category = await CodeMaster.create({
      code_name,
      displayorder,
      Active,
      ParentPk: -1,
      code_level: 1,
    });

    return res.status(200).json({
      success: true,
      message: 'Category created successfully',
      category: category
    });

  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
})

router.get('/api/getCategoryListData', async function (req, res) {
  try {
    let draw = req.query.draw;

    let start = parseInt(req.query.start);

    let length = parseInt(req.query.length);

    let where = {}

    if (req.query.search.value) {
      where[Op.or] = [
        { code_name: { [Op.like]: `%${req.query.search.value}%` } },
        { code_level: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const itemtype = await CodeMaster.findAll({
      where: {
        ...where,
        code_level: '1'
      },
      limit: length,
      offset: start,
    })

    const count = await CodeMaster.count({ where: { code_level: '1' } })

    let data_arr = []
    for (let i = 0; i < itemtype.length; i++) {


      data_arr.push({
        'code_name': itemtype[i].code_name,
        'code_level': itemtype[i].code_level,
        'Active': itemtype[i].Active,
        'rowguid': itemtype[i].rowguid
      });
    }

    let output = {
      'draw': draw,
      'iTotalRecords': count,
      'iTotalDisplayRecords': count,
      'aaData': data_arr
    };

    return res.status(200).json({
      success: true,
      message: "Category data fetched successfully",
      category: output
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Category data fetched successfully",
      category: output
    })
  }
});

router.get('/api/getUpdateCategoryData/:id', async function (req, res) {

  try {

    const category = await CodeMaster.findOne({ where: { rowguid: req.params.id } })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Category data fetched successfully',
      category: category
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
});

router.put("/api/updateCategory/:id", async (req, res) => {
  try {

    const category = await CodeMaster.findOne({ where: { rowguid: req.params.id } })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (!req.body.code_name) {
      return res.status(400).json({
        success: false,
        message: "Category field can not be blank"
      })
    }

    const updateCategory = await category.update({ ...req.body, ParentPk: -1, code_level: 1 }, { where: { rowguid: req.params.id } });
    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updateCategory
    });

  }
  catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
})


// Department Api

// getting all the category
router.get("/api/getAllCategory", async (req, res) => {
  try {
    const categories = await CodeMaster.findAll({
      where: { code_level: "1" },
    });

    return res.status(200).json({
      success: true,
      message: "All categories data fetched successfully",
      categories: categories
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});

// create department api
router.post("/api/addDepartment", async (req, res) => {
  try {
    const { code_name, displayorder, ParentPk, Active } = req.body;

    if (!req.body.code_name) {
      return res.status(400).json({
        success: false,
        message: "department field can not be blank"
      })
    }

    if (!req.body.ParentPk) {
      return res.status(400).json({
        success: false,
        message: "category field can not be blank"
      })
    }

    // Create a new category
    const department = await CodeMaster.create({
      code_name,
      displayorder,
      Active,
      ParentPk,
      code_level: 2,
    });

    return res.status(200).json({
      success: true,
      message: "Department created successfully",
      department: department
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// Department list api
router.get('/api/departmentListData', async function (req, res) {
  try {
    let draw = req.query.draw;

    let start = parseInt(req.query.start);

    let length = parseInt(req.query.length);

    let where = {}

    if (req.query.search.value) {
      where[Op.or] = [
        { code_name: { [Op.like]: `%${req.query.search.value}%` } },
        { code_level: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const itemtype = await CodeMaster.findAll({
      where: {
        ...where,
        code_level: '2'
      },
      limit: length,
      offset: start,
    })

    const count = await CodeMaster.count({ where: { code_level: '2' } })

    let data_arr = []
    for (let i = 0; i < itemtype.length; i++) {


      data_arr.push({
        'code_name': itemtype[i].code_name,
        'code_level': itemtype[i].code_level,
        'Active': itemtype[i].Active,
        'rowguid': itemtype[i].rowguid
      });
    }

    let output = {
      'draw': draw,
      'iTotalRecords': count,
      'iTotalDisplayRecords': count,
      'aaData': data_arr
    };

    return res.status(200).json({
      success: true,
      message: "Department list data fetched successfully",
      department: output
    })
  } catch (err) {
    console.log(err)
    return res.status(200).json({
      success: true,
      message: "Something went wrong"
    })
  }
});

// get updating department api
router.get('/api/getUpdateDepartmentData/:id', async function (req, res) {
  try {
    const department = await CodeMaster.findOne({ where: { rowguid: req.params.id } })

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Department data fetched successfully',
      department: department
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
});

// update department api
router.put("/api/updateDepartment/:id", async (req, res) => {
  try {
    const department = await CodeMaster.findOne({ where: { rowguid: req.params.id } })

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    const updatedDepartment = await department.update({ ...req.body }, { where: { rowguid: req.params.uuid } });
    return res.status(200).json({
      success: true,
      message: 'Department data updated successfully',
      department: updatedDepartment
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
})



//group api

// get all department api

router.get("/api/getAllDepartments", async (req, res) => {
  try {
    const Departments = await CodeMaster.findAll({
      where: { code_level: "2" }
    });
    return res.status(200).json({
      success: true,
      message: "All Department data fetched successfully",
      Departments: Departments
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
});

// create group api
router.post("/api/addGroup", async (req, res) => {
  try {

    const { code_name, displayorder, ParentPk, Active } = req.body;

    if (!req.body.code_name) {
      return res.status(400).json({
        success: false,
        message: "group field can not be blank"
      })
    }

    if (!req.body.ParentPk) {
      return res.status(400).json({
        success: false,
        message: "department field can not be blank"
      })
    }
    // Create a new category
    const group = await CodeMaster.create({
      code_name,
      Active,
      displayorder,
      ParentPk,
      code_level: 3,
    });

    return res.status(200).json({
      success: true,
      message: "Group created successfully",
      group: group
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// group list api
router.get('/api/getGroupListData', async function (req, res) {
  try {
    let draw = req.query.draw;

    let start = parseInt(req.query.start);

    let length = parseInt(req.query.length);

    let where = {}

    if (req.query.search.value) {
      where[Op.or] = [
        { code_name: { [Op.like]: `%${req.query.search.value}%` } },
        { code_level: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const itemtype = await CodeMaster.findAll({
      where: {
        ...where,
        code_level: '3',
        isDeleted: '0'
      },
      limit: length,
      offset: start,
    })

    const count = await CodeMaster.count({ where: { code_level: '3', isDeleted: '0' } })

    let data_arr = []
    for (let i = 0; i < itemtype.length; i++) {


      data_arr.push({
        'code_name': itemtype[i].code_name,
        'code_level': itemtype[i].code_level,
        'Active': itemtype[i].Active,
        'rowguid': itemtype[i].rowguid
      });
    }

    let output = {
      'draw': draw,
      'iTotalRecords': count,
      'iTotalDisplayRecords': count,
      'aaData': data_arr
    };

    return res.status(200).json({
      success: true,
      message: "Group data fetched successfully",
      groups: output
    })
  } catch (err) {
    console.log(err)
    return res.status(200).json({
      success: false,
      message: "Something went wrong",
    })
  }
});

//get update group data api
router.get('/api/getupdateGroup/:id', async function (req, res) {
  try {
    const group = await CodeMaster.findOne({ where: { rowguid: req.params.id } })

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Selected group details fetched successfully",
      group: group
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }

});

//update group api
router.post("/api/updateGroup/:id", async (req, res) => {
  try {

    const group = await CodeMaster.findOne({ where: { rowguid: req.params.id } })

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      })
    }

    const updateGroup = await group.update({ ...req.body });

    return res.status(200).json({
      success: true,
      message: "Selected group details updated successfully",
      group: updateGroup
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }

})


//Supplier Api

// Get user store 
router.get('/api/getUserStore/:userId', async function (req, res) {
  try {
    const userId = req.params.userId

    const user = await User.findOne({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
    let userStores = []
    userStores = userStoreMapping.map(mapping => mapping.storeFk)
    const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
    return res.status(200).json({
      success: true,
      message: "User stores are fetched successfully",
      store: store
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})

// create supplier api
router.post("/api/addSupplier", async (req, res) => {

  try {
    let getCode = await AutoGenerateNumber.findOne({ where: { prefix: "SUPL" } })

    // Increment the lastno value and pad it to 6 digits
    const newLastNo = (parseInt(getCode.lastNo) + 1).toString().padStart(6, '0');

    // Construct the unique identifier string
    const generateCode = `${getCode.prefix}/${newLastNo}/${getCode.suffix}`;

    // Update the lastno value in the database
    const updateGenerateCode = await AutoGenerateNumber.update(
      { lastNo: newLastNo },
      { where: { id: getCode.id } }
    );

    const {
      outletId,
      Name,
      ContactPersonName,
      ContactNo,
      Pincode,
      Email,
      AadharNo,
      GSTNo,
      PAN,
      CreditLimit,
      CreditDays,
      Status,
      Address
    } = req.body

    if (!req.body.outletId) {
      return res.status(400).json({
        success: false,
        message: "store field can not be blank"
      })
    }

    if (!req.body.Name) {
      return res.status(400).json({
        success: false,
        message: "Supplier name field can not be blank"
      })
    }

    if (!req.body.ContactNo) {
      return res.status(400).json({
        success: false,
        message: "Contact No field can not be blank"
      })
    }

    if (!req.body.Email) {
      return res.status(400).json({
        success: false,
        message: "Email field can not be blank"
      })
    }

    if (!req.body.GSTNo) {
      return res.status(400).json({
        success: false,
        message: "Gst No field can not be blank"
      })
    }

    if (!req.body.PAN) {
      return res.status(400).json({
        success: false,
        message: "Pan No field can not be blank"
      })
    }

    if (!req.body.Address) {
      return res.status(400).json({
        success: false,
        message: "Address field can not be blank"
      })
    }

    const supplier = await SupplierMaster.create({ ...req.body, Code: generateCode, storeFk: req.body.outletId });

    return res.status(200).json({
      success: true,
      message: "Supplier created successfully",
      supplier: supplier
    })

  }

  catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }

});


// get supplier list api
router.get('/api/getSupplierListData', async function (req, res) {
  try {
    let draw = req.query.draw;
    let start = parseInt(req.query.start);
    let length = parseInt(req.query.length);
    let outletId = req.query.outletId;


    let where = {};

    if (req.query.search.value) {
      where[Op.or] = [
        { Code: { [Op.like]: `%${req.query.search.value}%` } },
        { Name: { [Op.like]: `%${req.query.search.value}%` } },
        { Email: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    if (outletId) {

      where.storeFk = outletId  // Filter by outletId if provided
    }

    const supplier = await SupplierMaster.findAndCountAll({
      where: where,
      limit: length,
      offset: start
    });

    let data_arr = [];
    for (let i = 0; i < supplier.rows.length; i++) {
      data_arr.push({
        'Code': supplier.rows[i].Code,
        'Name': supplier.rows[i].Name,
        'Email': supplier.rows[i].Email,
        'rowguid': supplier.rows[i].rowguid
      });
    }

    let output = {
      'draw': draw,
      'iTotalRecords': supplier.count,
      'iTotalDisplayRecords': supplier.count,
      'aaData': data_arr
    };

    return res.status(200).json({
      success: true,
      message: "Supplier data fetched successfully",
      supplier: output
    });

  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});


// get update store data api
router.get('/api/getUpdateSupplierData/:id', async function (req, res) {

  try {
    const supplier = await SupplierMaster.findOne({ where: { rowguid: req.params.id } })
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "supplier not found"
      })
    }
    const store = await Store.findOne({ where: { outletId: supplier.storeFk } })
    return res.status(200).json({
      success: true,
      message: "Supplier data fetched successfully",
      supplier: supplier,
      store: store
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }

});

// update supplier api
router.put("/api/updateSupplier/:id", async (req, res) => {
  try {

    const supplier = await SupplierMaster.findOne({ where: { rowguid: req.params.id } })
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "supplier not found"
      })
    }

    if (!req.body.outletId) {
      return res.status(400).json({
        success: false,
        message: "store field can not be blank"
      })
    }

    if (!req.body.Name) {
      return res.status(400).json({
        success: false,
        message: "Supplier name field can not be blank"
      })
    }

    if (!req.body.ContactNo) {
      return res.status(400).json({
        success: false,
        message: "Contact No field can not be blank"
      })
    }

    if (!req.body.Email) {
      return res.status(400).json({
        success: false,
        message: "Email field can not be blank"
      })
    }

    if (!req.body.GSTNo) {
      return res.status(400).json({
        success: false,
        message: "Gst No field can not be blank"
      })
    }

    if (!req.body.PAN) {
      return res.status(400).json({
        success: false,
        message: "Pan No field can not be blank"
      })
    }

    if (!req.body.Address) {
      return res.status(400).json({
        success: false,
        message: "Address field can not be blank"
      })
    }
    const updateSupplier = await supplier.update({ ...req.body, storeFk: req.body.outletId });
    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier: updateSupplier
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }

})


// Customer api

// create customer api
router.post("/api/addCustomer", async (req, res) => {
  try {
    let getCode = await AutoGenerateNumber.findOne({ where: { prefix: "CUST" } })

    // Increment the lastno value and pad it to 6 digits
    const newLastNo = (parseInt(getCode.lastNo) + 1).toString().padStart(6, '0');

    // Construct the unique identifier string
    const generateCode = `${getCode.prefix}/${newLastNo}/${getCode.suffix}`;

    // Update the lastno value in the database
    const updateGenerateCode = await AutoGenerateNumber.update(
      { lastNo: newLastNo },
      { where: { id: getCode.id } }
    );


    const {
      Code,
      Name,
      ContactPersonName,
      ContactNo1,
      ContactNo2,
      Pincode,
      Email,
      AadharNo,
      GSTNo,
      PAN,
      Address
    } = req.body

    if (!req.body.Name) {
      return res.status(400).json({
        success: false,
        message: "Customer name field can not be blank"
      })
    }

    if (!req.body.ContactNo1) {
      return res.status(400).json({
        success: false,
        message: "ContactNo1 field can not be blank"
      })
    }

    if (!req.body.Email) {
      return res.status(400).json({
        success: false,
        message: "Email field can not be blank"
      })
    }

    const customer = await CustomerMaster.create({ ...req.body, Code: generateCode });

    return res.status(200).json({
      success: true,
      message: "Customer created successfully",
      customer: customer
    })

  }

  catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }

})

// customer list api
router.get('/api/getCustomerListData', async function (req, res) {
  try {
    let draw = req.query.draw;

    let start = parseInt(req.query.start);

    let length = parseInt(req.query.length);

    let where = {}

    if (req.query.search.value) {
      where[Op.or] = [
        { Code: { [Op.like]: `%${req.query.search.value}%` } },
        { Name: { [Op.like]: `%${req.query.search.value}%` } },
        { Email: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const customer = await CustomerMaster.findAll({
      limit: length,
      offset: start,
      where: where
    })

    const count = await CustomerMaster.count()

    let data_arr = []
    for (let i = 0; i < customer.length; i++) {


      data_arr.push({
        'Code': customer[i].Code,
        'Name': customer[i].Name,
        'Email': customer[i].Email,
        'rowguid': customer[i].rowguid
      });
    }

    let output = {
      'draw': draw,
      'iTotalRecords': count,
      'iTotalDisplayRecords': count,
      'aaData': data_arr
    };

    res.status(200).json({
      success: true,
      message: "Customer list data fetched successfully",
      customer: output
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }
});

// get customer update data
router.get('/api/getUpdateCustomerData/:id', async function (req, res) {
  try {
    const customer = await CustomerMaster.findOne({ where: { rowguid: req.params.id } })
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "customer not found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Customer data fetched successfully",
      customer: customer
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }
});

// update customer api
router.put("/api/updateCustomer/:id", async (req, res) => {
  try {
    const customer = await CustomerMaster.findOne({ where: { rowguid: req.params.id } })
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "customer not found"
      })
    }
    if (!req.body.Name) {
      return res.status(400).json({
        success: false,
        message: "Customer name field can not be blank"
      })
    }

    if (!req.body.ContactNo1) {
      return res.status(400).json({
        success: false,
        message: "ContactNo1 field can not be blank"
      })
    }

    if (!req.body.Email) {
      return res.status(400).json({
        success: false,
        message: "Email field can not be blank"
      })
    }
    const updateCustomer = await customer.update({ ...req.body });
    return res.status(200).json({
      success: true,
      message: "Selected customer data updated successfully",
      customer: updateCustomer
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }

})




// state api

// create state api
router.post("/api/addState", async (req, res) => {


  try {
    const {
      Code,
      Name
    } = req.body

    if (!Name) {
      return res.status(400).json({
        success: false,
        message: "State name field can not be blank",
      })
    }
    if (!Code) {
      return res.status(400).json({
        success: false,
        message: "Code field can not be blank",
      })
    }
    const state = await StateMaster.create(req.body);
    return res.status(200).json({
      success: true,
      message: "State created successfully",
      state: state
    })

  }

  catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }
}
)

//state list api
router.get('/api/stateListData', async function (req, res) {

  try {
    let draw = req.query.draw;

    let start = parseInt(req.query.start);

    let length = parseInt(req.query.length);

    let where = {}

    if (req.query.search.value) {
      where[Op.or] = [
        { Code: { [Op.like]: `%${req.query.search.value}%` } },
        { Name: { [Op.like]: `%${req.query.search.value}%` } },
        { Status: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const state = await StateMaster.findAll({
      limit: length,
      offset: start,
      where: where
    })

    const count = await StateMaster.count()

    let data_arr = []
    for (let i = 0; i < state.length; i++) {


      data_arr.push({
        'Code': state[i].Code,
        'Name': state[i].Name,
        'Status': state[i].Status,
        'rowguid': state[i].rowguid
      });
    }

    let output = {
      'draw': draw,
      'iTotalRecords': count,
      'iTotalDisplayRecords': count,
      'aaData': data_arr
    };

    return res.status(200).json({
      success: true,
      message: "State list data fetched successfully",
      state: output
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }

});

//get state update data api
router.get("/api/getUpdateStateData/:id", checkUser, async (req, res) => {
  try {
    const state = await StateMaster.findOne({ where: { rowguid: req.params.id } })
    if (!state) {
      return res.status(404).json({
        success: false,
        message: "state not found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "State data fetched successfully",
      state: state
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }

})

// update state api
router.put("/api/updateState/:id", async (req, res) => {
  try {
    const state = await StateMaster.findOne({ where: { rowguid: req.params.id } })
    if (!state) {
      return res.status(404).json({
        success: false,
        message: "state not found"
      })
    }
    if (!req.body.Name) {
      return res.status(400).json({
        success: false,
        message: "state name field can not be blank"
      })
    }
    if (!req.body.Code) {
      return res.status(400).json({
        success: false,
        message: "state code field can not be blank"
      })
    }

    const updateState = await state.update({ ...req.body });
    return res.status(200).json({
      success: true,
      message: "State data updated successfully",
      state: updateState
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }

})




//  tax api


//get all state api 
router.get("/api/getAllStates", async (req, res) => {
  try {
    const Allstate = await StateMaster.findAll({
      where: { Status: "Active" },
    });
    // console.log(555555, Allstate);
    return res.status(200).json({
      success: true,
      message: "All states data fetched successfully",
      state: Allstate
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});

//create tax api 
router.post("/api/addTaxState", async (req, res) => {
  try {
    let getCode = await AutoGenerateNumber.findOne({ where: { prefix: "TAX" } })

    // Increment the lastno value and pad it to 6 digits
    const newLastNo = (parseInt(getCode.lastNo) + 1).toString().padStart(6, '0');

    // Construct the unique identifier string
    const generateCode = `${getCode.prefix}/${newLastNo}/${getCode.suffix}`;

    // Update the lastno value in the database
    const updateGenerateCode = await AutoGenerateNumber.update(
      { lastNo: newLastNo },
      { where: { id: getCode.id } }
    );


    const {
      HSN_Code,
      Tax_percentage,
      Description,
      State_Code,
    } = req.body

    if (!req.body.Tax_percentage) {
      return res.status(400).json({
        success: false,
        message: " Tax percentage field can not be blank"
      })
    }

    if (!req.body.State_Code) {
      return res.status(400).json({
        success: false,
        message: "State field can not be blank"
      })
    }


    const tax = await TaxMaster.create({ ...req.body, Tax_Code: generateCode });
    return res.status(200).json({
      success: true,
      message: "Tax state created successfully",
      tax: tax
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }

})

//tax list api 
router.get('/api/getTaxStateListData', async function (req, res) {
  try {
    let draw = req.query.draw;

    let start = parseInt(req.query.start);

    let length = parseInt(req.query.length);

    let where = {}

    if (req.query.search.value) {
      where[Op.or] = [
        { Tax_Code: { [Op.like]: `%${req.query.search.value}%` } },
        { Description: { [Op.like]: `%${req.query.search.value}%` } },
        { Tax_percentage: { [Op.like]: `%${req.query.search.value}%` } },
      ];
    }

    const taxval = await TaxMaster.findAll({
      limit: length,
      offset: start,
      where: where
    })

    const count = await TaxMaster.count()

    let data_arr = []
    for (let i = 0; i < taxval.length; i++) {


      data_arr.push({
        'Tax_Code': taxval[i].Tax_Code,
        'Description': taxval[i].Description,
        'Tax_percentage': taxval[i].Tax_percentage,
        'rowguid': taxval[i].rowguid
      });
    }

    let output = {
      'draw': draw,
      'iTotalRecords': count,
      'iTotalDisplayRecords': count,
      'aaData': data_arr
    };

    res.status(200).json({
      success: true,
      message: " tax list data fetched successfully",
      taxs: output
    })
  } catch (err) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }
});

//get tax update data api
router.get("/api/getUpdateTaxStateData/:id", checkUser, async (req, res) => {

  try {
    const tax = await TaxMaster.findOne({ where: { rowguid: req.params.id } })
    // const stateNameById = await StateMaster.findOne({ where: { id: tax.State_Code } })

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: "tax state not found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Tax state data fetched successfully",
      tax: tax,

    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }
})

//update tax api
router.put("/api/updateTaxState/:id", async (req, res) => {

  try {
    const tax = await TaxMaster.findOne({ where: { rowguid: req.params.id } })

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: "Tax state not found"
      })
    }
    if (!req.body.HSN_Code) {
      return res.status(400).json({
        success: false,
        message: "tax HSN_Code field can not be blank"
      })
    }
    if (!req.body.Tax_percentage) {
      return res.status(400).json({
        success: false,
        message: "tax Tax_percentage field can not be blank"
      })
    }

    if (!req.body.State_Code) {
      return res.status(400).json({
        success: false,
        message: "tax State_Code field can not be blank"
      })
    }
    const updateState = await tax.update({ ...req.body });
    return res.status(200).json({
      success: true,
      message: "Tax state data updated successfully",
      tax: updateState
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }


})



//bulk product upload
router.post('/api/uploadBulkProducts', bulkUpload.single('file'), async (req, res) => {
  try {
    const xlsx = require('xlsx');
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file"
      })
    }
    if (req.file) {
      const filePath = req.file.path;
      const fileData = fs.readFileSync(filePath);
      const workbook = xlsx.read(fileData, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const productsInJson = xlsx.utils.sheet_to_json(sheet);


      for (const productData of productsInJson) {
        // console.log(productData)

        const newFileName = `${new Date().getTime()}_${productData.imageUrl}`
        const target_path = `public/uploads/${newFileName}`;
        /** A better way to copy the uploaded file. **/
        // const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);
        // src.pipe(dest);
        // src.on('end', function () { });
        // src.on('error', function (err) { });

        let getCode = await AutoGenerateNumber.findOne({ where: { prefix: "PROD" } })

        // Increment the lastno value and pad it to 6 digits
        const newLastNo = (parseInt(getCode.lastNo) + 1).toString().padStart(6, '0');

        // Construct the unique identifier string
        const generateCode = `${getCode.prefix}/${newLastNo}/${getCode.suffix}`;

        // Update the lastno value in the database
        const updateGenerateCode = await AutoGenerateNumber.update(
          { lastNo: newLastNo },
          { where: { id: getCode.id } }
        );


        let manufacturer = await Manufacturer.findOne({ where: { shortDescription: productData.Brand } });

        if (!manufacturer) {
          manufacturer = await Manufacturer.create({ shortDescription: productData.Brand });
        }

        let category = await CodeMaster.findOne({ where: { code_name: productData.Category } })


        if (!category) {
          category = await CodeMaster.create({ code_name: productData.Category, code_level: '1', ParentPk: '-1' });
        }

        let department = await CodeMaster.findOne({ where: { code_name: productData.Department } })

        if (!department) {
          department = await CodeMaster.create({ code_name: productData.Department, code_level: '2', ParentPk: category.id });
        }

        let group = await CodeMaster.findOne({ where: { code_name: productData.Group, code_level: '3' } })

        if (!group) {
          group = await CodeMaster.create({ code_name: productData.Group, code_level: '3', ParentPk: department.id });
        }

        // let itemType = await CodeMaster.findOne({ where: { code_name: productData['Item Type'], code_level: '4' } })

        // if (!itemType) {
        //     itemType = await CodeMaster.create({ code_name: productData['Item Type'], code_level: '4', ParentPk: group.id });
        // }

        let tax = await TaxMaster.findOne({ where: { Tax_percentage: productData.Tax } })

        if (!tax) {
          tax = await TaxMaster.create({ Tax_percentage: productData.Tax });
        }

        // Create the product with the manufacturer ID
        await NewProduct.create({
          itemName: productData['Item Name'],
          hsnCode: productData['HSN Code'],
          category: category.id,
          department: department.id,
          group: group.id,
          // itemType: itemType.id,
          brand: manufacturer.manufacturerId,
          itemCode: generateCode,
          description: productData.Description,
          status: productData.Status,
          weight: productData.Weight,
          imageUrl: '',
          tax: tax.id,
          pageN: productData.pageN,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Products uploaded successfully",
      })
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
})



// Sales Executive

router.get("/salesExecutive", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores } })
  res.render("salesExecutive/salesExecutive", { title: 'Express', store });
})

router.post('/createSalesExecutive', salesExecutiveController.createSalesExecutive)

// sales executive list
router.get("/salesExecutiveList", checkUser, async (req, res) => {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores } })
  res.render("salesExecutive/salesExecutiveList", { title: 'Express', message: req.flash('message'), store });
})

router.post('/salesExecutiveDetailsList', async function (req, res) {  // Change to POST request
  let draw = req.body.draw;
  let start = parseInt(req.body.start);
  let length = parseInt(req.body.length);
  let outletId = req.body.outletId;  // Retrieve outletId from the request


  let where = {};

  if (req.body.search.value) {
    where[Op.or] = [
      { name: { [Op.like]: `%${req.body.search.value}%` } },
      { email: { [Op.like]: `%${req.body.search.value}%` } },
      { contactNo: { [Op.like]: `%${req.body.search.value}%` } },
    ];
  }

  if (outletId) {

    where.storeFk = outletId  // Filter by outletId if provided
  }

  const salesExecutive = await SalesExecutive.findAndCountAll({
    where: { ...where, isDeleted: '0' },
    limit: length,
    offset: start
  });

  let data_arr = [];
  for (let i = 0; i < salesExecutive.rows.length; i++) {
    data_arr.push({
      'name': salesExecutive.rows[i].name,
      'email': salesExecutive.rows[i].email,
      'contactNo': salesExecutive.rows[i].contactNo,
      'rowguid': salesExecutive.rows[i].rowguid
    });
  }

  let output = {
    'draw': draw,
    'iTotalRecords': salesExecutive.count,
    'iTotalDisplayRecords': salesExecutive.count,
    'aaData': data_arr
  };

  res.json(output);
});

// sales executive update
router.get('/salesExecutiveUpdate/:uuid', checkUser, async function (req, res) {
  // console.log(219874651,req.params.uuid)
  const salesExecutive = await SalesExecutive.findOne({ where: { rowguid: req.params.uuid } })
  const previousStore = await Store.findOne({ where: { outletId: salesExecutive.storeFk } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores } })

  res.render('salesExecutive/salesExecutiveUpdate', { title: 'Express', salesExecutive, previousStore, store });
});


router.post("/salesExecutiveUpdate/:uuid", salesExecutiveController.updateSalesExecutive)


router.post('/deleteSalesExecutive/:id', async (req, res) => {
  const supplier = await SalesExecutive.findOne({ where: { rowguid: req.params.id } })
  await supplier.update({ isDeleted: '1' })
  return res.json(true)
});




// purchase order 

//refference number generator
router.get("/purchaseOrderNo", async (req, res) => {
  try {
    const purchaseOrderNo = await AutoGenerateNumber.findAll({ where: { prefix: "PURCHASE", suffix: "ORDER" } })
    res.status(201).json(purchaseOrderNo)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

router.get('/purchaseOrder', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active', approve_b: 'approved' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('purchaseOrder/purchaseOrder', { title: 'Express', message: req.flash('message'), store, product });
});

router.post('/createPurchaseOrder', stockInOutController.createPurchaseOrder)


// purchase order List

router.get('/purchaseOrderList', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })

  res.render('purchaseOrder/purchaseOrderList', { title: 'Express', store, message: req.flash('message') });
});

router.get('/purchaseOrderListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await PurchaseOrder.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'In',
      orderType: 'order',
      isDeleted: '0'
    },
    include: [
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    order: [['orderId', 'DESC']],
    // where: where, // Apply the filtering
  });

  const count = await PurchaseOrder.count({ where: { stockType: 'In', orderType: 'order', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      purchaseOrderNo: order[i].purchaseOrderNo,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      rowguid: order[i].rowguid,
      approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});


// purchase order update module

router.get('/purchaseOrderUpdate/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await PurchaseOrder.findOne({ where: { rowguid: orderId } })

  const productPrice = await PurchaseOrderItems.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId, status: 'Active' } })
  const previousSupplier = await SupplierMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('purchaseOrder/updatePurchaseOrder', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousSupplier, store, product });
});

// populate the multiplae product details into stockInUpdate module
router.get('/existingPurchaseOrderProductDetails/:productId', async function (req, res) {
  const itemId = req.params.productId
  const products = await PurchaseOrderItems.findAll({ where: { orderFk: itemId } })
  res.json(products)
})

// stcok in update delete row data
router.post('/deleteRowDataPurchaseOrder/:itemId/:batchNo/:orderId', async function (req, res) {
  await PurchaseOrderItems.destroy({ where: { itemId: req.params.itemId, batchNO: req.params.batchNo, stockType: 'In', orderFk: req.params.orderId } })
});

router.post('/updatePurchaseOrder/:id', stockInOutController.updatePurchaseOrder)


// purchase order update module

router.get('/purchaseOrderView/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await PurchaseOrder.findOne({ where: { rowguid: orderId } })

  const productPrice = await PurchaseOrderItems.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId, status: 'Active' } })
  const previousSupplier = await SupplierMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('purchaseOrder/viewPurchaseOrder', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousSupplier, store, product });
});


// delete purchase order

router.post('/deletePurchaseOrder/:id', async (req, res) => {

  const order = await PurchaseOrder.findOne({ where: { rowguid: req.params.id } })
  await order.update({ isDeleted: '1', deleteRemark: req.body.remark })
  return res.json(true)
});



// Stock In Api

router.get('/purchaseInvoice', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active', approve_b: 'approved' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('purchaseInvoice/purchaseInvoice', { title: 'Express', message: req.flash('message'), store, product });
});


// populate the multiplae product details into stockInUpdate module
router.get('/purchaseOrderNo/:supplierId', async function (req, res) {
  const supplierId = req.params.supplierId
  const supplier = await SupplierMaster.findOne({ where: { id: supplierId } })
  const purchaseOrderNos = await PurchaseOrder.findAll({ where: { customerName: supplier.Name, isDeleted: '0', isInvoiceGenerated: '0' } })
  res.json(purchaseOrderNos)
})

// populate the multiplae product details into stockInUpdate module
router.get('/getProductsForPurchaseOrder/:orderId', async function (req, res) {
  const orderId = req.params.orderId
  const order = await PurchaseOrder.findOne({ where: { orderId: orderId } })
  const products = await PurchaseOrderItems.findAll({ where: { orderFk: order.orderId } })
  res.json(products)
})


router.get("/purchaseReturnNo", async (req, res) => {
  try {
    const purchaseReturnNo = await AutoGenerateNumber.findAll({ where: { prefix: "PURCHASE", suffix: "RETURN" } })
    res.status(201).json(purchaseReturnNo)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

// purchase invoice cancel
router.get('/purchaseInvoiceCancel', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active', approve_b: 'approved' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('purchaseInvoiceCancel/purchaseInvoiceCancel', { title: 'Express', message: req.flash('message'), store, product });
});

router.get('/purchaseInvoiceNo/:supplierId', async function (req, res) {
  const supplierId = req.params.supplierId
  const supplier = await SupplierMaster.findOne({ where: { id: supplierId } })
  const purchaseInvoiceNos = await Order.findAll({ where: { customerName: supplier.Name, orderType: "order", stockType: "In", isReturn: "0" } })
  res.json(purchaseInvoiceNos)
})

// populate the multiplae product details into stockInUpdate module
router.get('/getProductsForPurchaseInvoiceNo/:orderId', async function (req, res) {
  console.log(123)
  const orderId = req.params.orderId
  console.log(123456, orderId)
  const order = await Order.findOne({ where: { orderId: orderId, isReturn: '0' } })
  const products = await ProductPrice.findAll({ where: { orderFk: order.orderId } })
  res.json(products)
})

// purchase cancel post api
router.post('/createPurchaseCancel', stockInOutController.addPurchaseCancel)


// stock In list Order wise

router.get('/purchaseInvoiceCancelList', checkUser, async function (req, res) {
  console.log(123)
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })

  res.render('purchaseInvoiceCancel/purchasInvoiceCancelList', { title: 'Express', store, message: req.flash('message') });
});

router.get('/purchaseInvoiceCancelListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  console.log(444, outletId)

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'Out',
      orderType: 'PR',
      isDeleted: '0'
    },
    include: [
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { stockType: 'Out', orderType: 'PR', isDeleted: '0' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      rowguid: order[i].rowguid,
      approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});

// only view data in stock in order
router.get('/purchaseInvoiceCancelView/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousSupplier = await SupplierMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('purchaseInvoiceCancel/purchaseInvoiceCancelView', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousSupplier, store, product });
});



// Sale Quotation

router.get("/saleQuotationInvoiceNumber", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "SQ" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}),

  router.get('/quotationSale', checkUser, async function (req, res) {
    const userId = req.session.userDetail.id
    const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
    let userStores = []
    userStores = userStoreMapping.map(mapping => mapping.storeFk)
    const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
    // const product = await NewProduct.findAll()
    const customer = await CustomerMaster.findAll({ where: { Status: 'Active' } })
    res.render('salesQuotation/quotationSale', { title: 'Express', message: req.flash('message'), store, customer });
  });


//create
router.post('/createQuotationSale', stockInOutController.addSaleQuotation);

//list 

router.get('/saleQuotationList', checkUser, async function (req, res) {
  // const userId = req.session.userDetail.id
  // const userStoreMapping = await UserStoreMapping.findAll({where : {userFk : userId}})
  // let userStores = []
  // userStores = userStoreMapping.map(mapping => mapping.storeFk)
  // const store = await Store.findAll({where : {outletId : userStores}})
  const store = await Store.findAll()
  res.render('salesQuotation/saleQuotationList', { title: 'Express', store, message: req.flash('message') });
});

router.get('/saleQuotationListData', async function (req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let outletId = req.query.outletId;  // Retrieve outletId from the request

  let draw = req.query.draw;

  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (outletId) {

    where.outletId = outletId  // Filter by outletId if provided
  }

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await SaleQuotation.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      stockType: 'In',
      orderType: 'order'
    },
    include: [
      //   // {
      //   //   model: NewProduct,
      //   //    attributes:['itemName']
      //   // },
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await SaleQuotation.count({ where: { stockType: 'In', orderType: 'order' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      referenceNumber: order[i].referenceNumber,
      customerName: order[i].customerName,
      totalAmount: order[i].totalAmount,
      rowguid: order[i].rowguid,
      approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});

// Update Sale Quotation edit
router.get('/updateSaleQuotation/:id', checkUser, async function (req, res) {

  const orderId = req.params.id
  const order = await SaleQuotation.findOne({ where: { rowguid: orderId } })
  // return console.log(4455,order)


  const productPrice = await SaleQuotationItem.findAll({ where: { orderFk: order.id } })
  // return console.log(productPrice)

  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousCustomer = await CustomerMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('salesQuotation/updateSaleQuotation', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousCustomer, store, product });
});

router.get('/saleRetunDetailsByReferenceReturn/:param1/:param2/:param3', async function (req, res) {
  try {
    const { param1, param2, param3 } = req.params;
    const orders = await SaleQuotation.findAll({ where: { referenceNumber: `${param1}/${param2}/${param3}` } });
    // console.log(555, orders);

    res.json(orders); // Adjust the response as needed
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/productName/:itemid', async (req, res) => {
  try {
    const ProductName = await NewProduct.findByPk(req.params.itemid);
    console.log(66, ProductName);
    res.json(ProductName);
  } catch (err) {
    res.json(err.message);
  }
});


router.get('/saleReturnUpdateid/:orderFk', async function (req, res) {
  try {
    const { orderFk } = req.params;
    const ordersItem = await SaleQuotationItem.findAll({ where: { orderFk } });
    res.json(ordersItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// post update

router.post('/updateSaleQuotation/:id', stockInOutController.updateSaleQuotaion);

// Update Sale Quotation edit
router.get('/saleQuotationView/:id', checkUser, async function (req, res) {

  const orderId = req.params.id
  const order = await SaleQuotation.findOne({ where: { rowguid: orderId } })
  // return console.log(4455,order)


  const productPrice = await SaleQuotationItem.findAll({ where: { orderFk: order.id } })
  // return console.log(productPrice)

  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousCustomer = await CustomerMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('salesQuotation/viewSaleQuotation', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousCustomer, store, product });
});


// Sales Return 

//get 

router.get("/salesReturnNo", async (req, res) => {
  try {
    const refNUM = await AutoGenerateNumber.findAll({ where: { prefix: "SALE", suffix: "Return" } })
    res.status(201).json(refNUM)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

// populate the multiplae product details into stockInUpdate module
router.get('/saleInvoiceProductDetails/:orderId', async function (req, res) {
  const orderId = req.params.orderId
  const order = await Order.findOne({ where: { orderId: orderId } })
  const products = await ProductPrice.findAll({ where: { orderFk: order.orderId } })
  res.json(products)
})

router.get('/saleInvoiceNo/:customerId', async function (req, res) {
  const customerId = req.params.customerId
  const customer = await CustomerMaster.findOne({ where: { id: customerId } })
  const salesReturnNos = await Order.findAll({ where: { customerName: customer.Name, orderType: "order", stockType: "Out", isReturn: "0" } })
  res.json(salesReturnNos)
})

router.get('/saleReturn', checkUser, async function (req, res) {
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  // const product = await NewProduct.findAll()
  const customer = await CustomerMaster.findAll({ where: { Status: 'Active' } })
  res.render('salesReturn/saleReturn', { title: 'Express', message: req.flash('message'), store, customer });
});

//post 
router.post('/createSalesReturn', stockInOutController.saleReturnEntry)

// get list
router.get('/saleReturnList', async function (req, res) {
  res.render('salesReturn/saleReturnList', { title: 'Express', message: req.flash('message') });
});


//sale return list data

router.get('/saleReturnListData', async function (req, res) {
  let draw = req.query.draw
  let start = parseInt(req.query.start);
  let length = parseInt(req.query.length);
  let where = {}; // Define the where object for filtering

  if (req.query.search.value) {
    where[Op.or] = [
      { '$new_product.itemName$': { [Op.like]: `%${req.query.search.value}%` } },
      { '$store_master.storeName$': { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const order = await Order.findAll({
    where: {
      ...where,
      orderType: 'SR'
    },
    include: [
      //   // {
      //   //   model: NewProduct,
      //   //    attributes:['itemName']
      //   // },
      {
        model: Store,
        attributes: ['storeName']
      },
    ],
    limit: length,
    offset: start,
    // where: where, // Apply the filtering
  });

  const count = await Order.count({ where: { orderType: 'SR' } });

  let data_arr = [];
  for (let i = 0; i < order.length; i++) {
    data_arr.push({
      storeName: order[i].store_master.storeName,
      salesInvoiceNo: order[i].salesInvoiceNo,
      referenceNumber: order[i].referenceNumber,
      saleExecutive: order[i].saleExecutive,
      totalAmount: order[i].totalAmount,
      rowguid: order[i].rowguid,
      approve_b: order[i].approve_b
    });
  }

  let output = {
    draw: draw,
    iTotalRecords: count,
    iTotalDisplayRecords: count,
    aaData: data_arr,
  };

  res.json(output);
});



// update get
router.get('/salesReturnUpdate/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })
  // return console.log(875,order)

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousCustomer = await CustomerMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('salesReturn/updateSalesReturn', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousCustomer, store, product });
});

router.get('/saleRetunDetailsByReference/:param1/:param2/:param3', async function (req, res) {
  try {
    const { param1, param2, param3 } = req.params;
    const orders = await Order.findAll({ where: { referenceNumber: `${param1}/${param2}/${param3}` } });
    // console.log(555, orders);

    res.json(orders); // Adjust the response as needed
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/saleRetunItem/:orderFk', async function (req, res) {
  try {
    const { orderFk } = req.params;
    const ordersItem = await ProductPrice.findAll({ where: { orderFk } });

    res.json(ordersItem); // Adjust the response as needed
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// update put
router.post('/updateSaleQuotationEntry/:id', stockInOutController.updateSaleQuotation);

// sale return view

router.get('/salesReturnView/:id', checkUser, async function (req, res) {
  const orderId = req.params.id
  const order = await Order.findOne({ where: { rowguid: orderId } })
  // return console.log(875,order)

  const productPrice = await ProductPrice.findOne({ where: { orderFk: order.orderId } })
  // const previousOrder = await Order.findOne({where : {orderId:productPrice.orderFk}})
  const previousStore = await Store.findOne({ where: { outletId: order.outletId } })
  const previousCustomer = await CustomerMaster.findOne({ where: { Email: order.customerEmail } })
  const userId = req.session.userDetail.id
  const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
  let userStores = []
  userStores = userStoreMapping.map(mapping => mapping.storeFk)
  const store = await Store.findAll({ where: { outletId: userStores, status: 'Active' } })
  //  let storeIds = []
  //  storeIds = store.map(mapping => mapping.outletId)
  // const store = await Store.findAll()
  const product = await NewProduct.findAll({ where: { status: 'Active' } })
  // const supplier = await SupplierMaster.findAll({where : {storeFk : storeIds}})
  res.render('salesReturn/salesReturnView', { title: 'Express', message: req.flash('message'), productPrice, previousStore, order, previousCustomer, store, product });
});


router.post('/deleteSalesInvoice/:id', stockInOutController.cancelSalesInvoice);


module.exports = router;
