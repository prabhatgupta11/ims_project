let express = require('express');
let router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const userController = require("../controllers/userController");
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
const stateMasterController=require("../controllers/stateMasterController")
const checkUser = require("../middleware/checkUser")
// const checkRole = require("../middleware/checkRole")
const db = require("../models");
const NewStore = db.newStore
const Store = db.store
const Product = db.products
const Manufacturer = db.manufacturer
const Category = db.category
const ProductStock = db.productStock
const User = db.user
const UserStoreMapping = db.userStoreMapping
const Order = db.order;
const OrderItems = db.orderItems
const SupplierMaster = db.supplier
const StateMaster = db.stateMaster
let multer = require('multer');
const upload = multer({ dest: 'public/' })
const bulkUpload = multer({ dest: 'public/' })



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




// logout Api

router.get('/logout', function (req, res) {
  req.session.isLoggedIn = false
  req.flash('message', 'You are Successfully Logout.');
  res.redirect('/');
});



// Dashboard Api

router.get('/dashboard', function (req, res) {
  res.render('dashboard', { title: 'Express', message: req.flash('message') });
});


// Create User Api

router.get('/user', async function (req, res) {
  const user = await User.findAll()
  res.render('user/user', { title: 'Express', message: req.flash('message'), user });
});

router.get('/getManagers/:role', async(req, res) => {
  const role = req.params.role;
  const managers = await User.findAll({where : {role : role}});
  const filteredManagers = managers.map((manager) => ({
    id: manager.id,
    email: manager.email,
  }))
  res.json(filteredManagers);
});

router.get('/getAllStores', async (req, res) => {
  const stores = await Store.findAll({where : {approve_b : 'approved'}}) 
  res.json(stores);
});

router.post('/createUser', userController.createUser)


// Update User Api

router.get('/userUpdate/:id', async function (req, res) {
 
  const user = await User.findOne({ where: { id: req.params.id } })
  
  const previousManager = await User.findOne({where : {id : user.managerFk}})
 
  // for edit mode get all users
  const allUsers = await User.findAll()
  res.render('user/userUpdate', { title: 'Express', message: req.flash('message'), user, editMode: true, allUsers,previousManager});
});

router.get('/getAllStoresForRole/:role', async (req, res) => {
  const stores = await Store.findAll({where : {approve_b : 'approved'}}) 
  res.json(stores);
});

router.post('/updateUser/:id', userController.updateUser)


// User Listing Api

router.get('/userList', function (req, res) {

  res.render('user/userList', { title: 'Express', message: req.flash('message') });
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
    where: where
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




// User Store Mapping Api

router.get('/userStoreMapping', async function (req, res) {
  const user = await User.findAll();
  const store = await Store.findAll({ where: { approve_b: 'approved' } })
  res.render('userStoreMapping', { title: 'Express', message: req.flash('message'), user, store });
});

router.get('/getSelectedStores/:userId', userStoreMapping.getUserStoreData)

//  router.post('/createUser', userStoreMapping.addUserStoreMapping)

router.post('/deselectStore/:userId/:outletId', userStoreMapping.deselectStore)


// Store Category Mapping

router.get('/storeCategoryMapping', async function (req, res) {
  const store = await Store.findAll({ where: { approve_b: 'approved' } });
  const category = await Category.findAll({ where: { approve_b: 'approved' } })
  res.render('storeCategoryMapping', { title: 'Express', message: req.flash('message'), category, store });
});

router.post('/storeCategoryMapping', storeCategoryMapping.addStoreCategoryMapping)

router.get('/getSelectedCategories/:outletId', storeCategoryMapping.getStoreCategoryData)

router.post('/deselectCategory/:outletId/:categoryId', storeCategoryMapping.deselectCategories)


// Create Product Api

router.get('/product', checkUser, async function (req, res) {
  const manufacturer = await Manufacturer.findAll({ where: { approve_b: 'approved' } })
  res.render('product/product', { title: 'Express', message: req.flash('message'), manufacturer });
});


router.post('/createProduct', upload.single('imageUrl'), productController.createProduct)



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




// Product Update Api

router.get('/updateProduct/:id', checkUser, async function (req, res) {

  const product = await Product.findOne({ where: { itemId: req.params.id } })

  const manufacturer = await Manufacturer.findAll({ where: { approve_b: 'approved' } })

  res.render('product/productUpdate', { title: 'Express', message: req.flash('message'), manufacturer, product });
});

router.post('/updateProduct/:id', upload.single('imageUrl'), productController.updateProduct)




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
router.get('/newStore', function (req, res) {
  res.render('store/newStore', { title: 'Express', message: req.flash('message') });
});

router.post("/createNewStore", storeController.createNewStore);

router.post("/createStore", storeController.createStore);



// Store List Api

router.get('/storeList', checkUser, async function (req, res) {
  res.render('store/storeMasterList', { title: 'Express', message: req.flash('message') });
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

router.get('/newStoreList', async function (req, res) {
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
  const store = await NewStore.findAll({
    where: {
      ...where, // Your initial where conditions, I assume
      approve_b: ["approved", "pending"]
    },
    limit: length,
    offset: start
  });

  const count = await NewStore.count()

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

router.post("/updateStore/:id", storeController.updateStore);


router.get('/updateNewStore/:id', async function (req, res) {
console.log(req.params.id,123456)
  let newStore = await NewStore.findOne({ where: { rowguid: req.params.id } })

  res.render('store/newStoreUpdate', { title: 'Express', message: req.flash('message'), newStore });
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

router.get('/stockInOut', checkUser, async function (req, res) {
  const store = await Store.findAll({ where: { approve_b: 'approved' } })
  const product = await Product.findAll({ where: { approve_b: 'approved' } })
  res.render('stockInOut', { title: 'Express', message: req.flash('message'), store, product });
});

router.post('/stockInOut', stockInOutController.stockInOut)




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

  res.json(output)
})



// Update Manufacturer Master Api

router.get('/updateManufacturer/:id', checkUser, async function (req, res) {
  const manufacturer = await Manufacturer.findOne({ where: { manufacturerId: req.params.id } })
  res.render('manufacturer/manufacturerUpdate', { title: 'Express', message: req.flash('message'), manufacturer });
});

router.post('/updateManufacturer/:id', manufacturerController.updateManufacturer)


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

router.get('/storeApprovalList', storeController.storeApprovalList);

router.post('/updateStoreApprovalStatus', storeController.updateStoreApprovalStatus)

// Product Approval List

router.get('/productApprovalList', productController.productApprovalList);

router.post('/updateProductApprovalStatus', productController.updateProductApprovalStatus)

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
  const store = await Store.findAll()
  const product = await Product.findAll()
  const productStock = await ProductStock.findAll()
  res.render('order/order', { title: 'Express', message: req.flash('message'), store, product,productStock });
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
  const orderItems = await OrderItems.findOne({ where: { orderPK : req.params.id } })
  const store = await Store.findAll({where : {approve_b : 'approved'}})
  const product = await Product.findAll({where : {approve_b : 'approved'}})
  res.render('order/orderUpdate', { title: 'Express', message: req.flash('message'), order, store, product,orderItems });
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
//////////////////////////////////////////
router.get("/getProductById/:itemId", async(req, res) => {
  const itemId =req.params.itemId;
 try{
  const productdata= await Product.findOne({where:{itemId:itemId}})
  res.json(productdata);
 }
 catch(err)
 {
  res.send(err.message,"Error while fetching the product based on itemid")
 }
});
//////////////////////getting the product price from productstock///////////////
router.get("/getpriceById/:itemId", async(req, res) => {
  const itemId =req.params.itemId;
 try{
  const productdata= await ProductStock.findOne({where:{itemId:itemId}})
  res.json(productdata);
 }
 catch(err)
 {
  res.send(err.message,"Error while fetching the product based on itemid")
 }
});

//for the orderUpdate
// Define a route to fetch orderItems by order ID
router.get('/getOrderItems/:id', async function (req, res) {
  const orderItems = await OrderItems.findAll({ where: { orderPK: req.params.id } });
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




// store wise product wise stock quantity

router.get('/getStoreWiseProduct', async function(req,res){

  const stores = await Store.findAll({where : {approve_b : 'approved'}})
    
    res.render('storeWiseStock', { title: 'Express', message: req.flash('message'),stores});

})

router.post('/getStoreWiseStock', async function (req, res) {
 
  const selectedStoreId = req.body.selectedStoreId; 

  try {
    if (selectedStoreId === 'all') {
      
      const allStores = await Store.findAll({where : {approve_b : 'approved'}});

      const allProducts = await Product.findAll({where : {approve_b : 'approved'}});

      let productsWithStock = [];

      for (const store of allStores) {
        for (const product of allProducts) {
          const stock = await ProductStock.findOne({
            where: { approve_b : 'approved', outletId: store.outletId, itemId: product.itemId }
          });

          productsWithStock.push({
            store,
            product,
            stock: stock ? stock.stock : 0
          });
        }
      }
      // Render your HBS template with the 'productsWithStock' array and all stores
      res.render('storeWiseStock', {  title: 'Express', message: req.flash('message'), productsWithStock, allStores, allProducts });
    } else {
    
    // Fetch the selected store
    const selectedStore = await Store.findOne({where : { approve_b : 'approved', outletId :selectedStoreId}});

    if (!selectedStore) {
      req.flash('message', 'Selected store not found')
      return res.redirect('/getStoreWiseProduct')
    }

    // Fetch products available in the selected store
    const productsInStore = await Product.findAll({where : {approve_b : 'approved'}});

    // Fetch stock quantities for each product in the selected store
     productsWithStock = [];

    for (const product of productsInStore) {
      const stock = await ProductStock.findOne({
        where: { approve_b : 'approved',outletId: selectedStoreId, itemId: product.itemId }
      });
      

      productsWithStock.push({
        store:selectedStore,
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

router.get('/getProductWiseStock', async function(req,res){
 
 const products = await Product.findAll({where : {approve_b : 'approved'}})
    
    res.render('productWiseStock', { title: 'Express', message: req.flash('message'),products});
})

router.post('/getProductWiseStock', async function (req, res) {
  const selectedProductId = req.body.selectedProductId; 
  try {
    if (selectedProductId === 'all') {
     
      const allProducts = await Product.findAll( {where : {approve_b : 'approved'}});

      const allStores = await Store.findAll({where : {approve_b : 'approved'}});

      const storeWithStock = [];

      for (const product of allProducts) {
        for (const store of allStores) {
          const stock = await ProductStock.findOne({
            where: { approve_b : 'approved',outletId: store.outletId, itemId: product.itemId }
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
    const selectedProduct = await Product.findOne( {where : {approve_b : 'approved',itemId : selectedProductId}} );

    if (!selectedProduct) {
      req.flash('message', 'Selected product not found')
      return res.redirect('/getProductWiseStock')
    }

    // Fetch products available in the selected store
    const stores = await Store.findAll({where : {approve_b : 'approved'}});

    // Fetch stock quantities for each product in the selected store
    const storeWithStock = [];

    for (const store of stores) {
    
      const stock = await ProductStock.findOne({
        where: {approve_b : 'approved', outletId: store.outletId, itemId: selectedProductId }
      });

      storeWithStock.push({
        product:selectedProduct,
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



// Supplier Master


router.get('/supplierMaster', function (req, res) {
  res.render('supplierMaster/supplierMaster', { title: 'Express' });
});

router.post("/createSuplierdata", supplierMasterController.createSuplier);


router.get('/suppliersMasterList', async function (req, res) {
  res.render('supplierMaster/supplierMasterList', { title: 'Express', message: req.flash('message') });
});


router.get('/supplierDetailsList', async function (req, res) {
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

  const supplier = await SupplierMaster.findAll({
    limit: length,
    offset: start,
    where: where
  })

  const count = await SupplierMaster.count()

  let data_arr = []
  for (let i = 0; i < supplier.length; i++) {


    data_arr.push({
      'Code': supplier[i].Code,
      'Name': supplier[i].Name,
      'Email': supplier[i].Email,
      'rowguid':supplier[i].rowguid
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


router.get('/updateSupplierMaster/:uuid', async function (req, res) {
  console.log(219874651,req.params.uuid)
  const supplier = await SupplierMaster.findOne({ where: { rowguid: req.params.uuid } })
  res.render('supplierMaster/supplierMasterUpdate', { title: 'Express', supplier });
});


//get route for getting all the data of supplier

router.get("/getAllsupplierdata",  supplierMasterController.supplierData)

router.post("/supplierMasterUpdate/:uuid",supplierMasterController.updateSuplier)



/********************************State Master*********************************** */
router.get("/stateMaster",(req,res)=>{
  res.render("stateMaster/stateMaster",{title:'Express'});
  })
  
  
  router.post("/createStateMaster",stateMasterController.createStateMaster)
  
  //state master listing
  router.get('/stateMasterList', async function (req, res) {
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
      where: where
    })
  
    const count = await StateMaster.count()
  
    let data_arr = []
    for (let i = 0; i < state.length; i++) {
  
  
      data_arr.push({
        'Code': state[i].Code,
        'Name': state[i].Name,
        'Status': state[i].Status,
        'rowguid':state[i].rowguid
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
  
  
  
  //state master update
  
  router.get("/updateStateMaster/:uuid", async(req,res)=>{
    const state= await StateMaster.findOne({where:{rowguid:req.params.uuid}})
  
    res.render("stateMaster/stateMasterUpdate",{title:'Express',state});
    })
    
    router.post("/stateMasterUpdate/:uuid",stateMasterController.updateStateMaster)
  
  /********************************State Master*********************************** */

module.exports = router;
