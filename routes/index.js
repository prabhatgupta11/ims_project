let express = require('express');
let router = express.Router();
const Sequelize = require('sequelize');
// router.use(bodyParser.urlencoded({ extended: false }));
// router.use(bodyParser.json());


const Op = Sequelize.Op;
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const storeController = require("../controllers/storeController")
const productStockController = require('../controllers/productStockController')
const stockInOutController = require("../controllers/stockInOutController")
const manufacturerController = require("../controllers/manufacturerController")
const categoryController = require("../controllers/categoryMasterController")
const billingController = require('../controllers/billingController');
const orderController = require('../controllers/orderController');
const orderItemsController=require("../controllers/orderItemController");
const productRaise = require('../controllers/productRaiseController');
const productCategoryMapping = require('../controllers/productCategoryMappingController')
const checkUser = require("../middleware/checkUser")
const db = require("../models");
const Store = db.store
const Product = db.products
const Manufacturer = db.manufacturer
const Category = db.category
const ProductStock = db.productStock
let multer = require('multer');
const database = require('../config/database');
const upload = multer({ dest: 'public/' })



// Register User Api

router.get('/register', function (req, res) {
  res.render('register', { title: 'Express' });
});

router.post("/register", userController.registerUser);





// Login User Api

router.get('/', function (req, res) {

  res.render('login', { title: 'Express', message: req.flash('message') });

});

router.post("/login", userController.loginUser);




// logout Api

router.get('/logout', function (req, res) {
  req.session.isLoggedIn = false
  req.flash('message', 'You are Sucessfully Logout.');
  res.redirect('/');
});





// Dashboard Api

router.get('/dashboard', checkUser, function (req, res) {
  res.render('dashboard', { title: 'Express', message: req.flash('message') });
});


// Create Product Api

router.get('/product', checkUser, async function (req, res) {
  const manufacturer = await Manufacturer.findAll()
  res.render('product', { title: 'Express', message: req.flash('message'), manufacturer });
});

router.post('/createProduct', upload.single('imageUrl'), productController.createProduct)



// Product Deatail Listing Api

router.get('/productDetailsList', checkUser, async function (req, res) {
  res.render('productDetailsList', { title: 'Express', message: req.flash('message')});
});

router.get('/productsDetailsList', checkUser, async function (req, res) {
 
  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  const productStock = await ProductStock.findAll({
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
    where: where
  })
  console.log(productStock)

  if (req.query.search.value) {
    where[Op.or] = [
      { itemName: { [Op.like]: `%${req.query.search.value}%` } },
      { storeName: { [Op.like]: `%${req.query.search.value}%` } },
      { Cat1: { [Op.like]: `%${req.query.search.value}%` } },
      { Cat2: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  
  const count = await ProductStock.count()
  

  let data_arr = []
  for (let i = 0; i <productStock.length; i++) {
    data_arr.push({
      'itemName' : productStock[i].product.itemName,
      'storeName': productStock[i].store_master.storeName,
      'stock': productStock[i].stock,
      'salePrice': productStock[i].salePrice,
      'mrp': productStock[i].mrp,
      'Cat1': productStock[i].Cat1,
      'Cat2': productStock[i].Cat2
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




// Product Master Listing Api

router.get('/productMasterList', checkUser, async function (req, res) {
  res.render('productMasterList', { title: 'Express', message: req.flash('message')});
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
    limit: length,
    offset: start,
    where: where
  })
  console.log(product)


  const count = await Product.count()
  

  let data_arr = []
  for (let i = 0; i <product.length; i++) {
    data_arr.push({
      'itemId' : product[i].itemId,
      'itemName' : product[i].itemName,
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
  console.log(123)
  let id = req.params.id
  const product = await Product.findOne({where:{itemId:req.params.id}})
  const manufacturer = await Manufacturer.findAll()
  res.render('productUpdate', { title: 'Express', message: req.flash('message'), manufacturer, product });
});

router.post('/updateProduct/:id', upload.single('imageUrl'), productController.updateProduct)




// Product Stock Api

router.post('/addProductStock', productStockController.addProductStock)




// Product Category Mroutering

router.get('/productCategoryMapping', checkUser, async function (req, res) {
  const store = await Store.findAll()
  const product = await Product.findAll()
  const category = await Category.findAll()
  res.render('productCategoryMapping', { title: 'Express', message: req.flash('message'),store,product,category});
});

// router.post('/productCategoryMroutering', productCategoryMroutering.productCategoryMroutering)




// Store Master Api

router.get('/storeMaster', checkUser, function (req, res) {
  res.render('storeMaster', { title: 'Express', message: req.flash('message') });
});

router.post("/createStore", storeController.createStore);



// Store List Api

router.get('/storeList', checkUser, async function (req, res) {
  res.render('storeMasterList', { title: 'Express', message: req.flash('message') });   
})

router.get('/storemasterList',  async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    console.log(req.query.search.value)
    where[Op.or] = [
      { storeName: { [Op.like]: `%${req.query.search.value}%` } },
      { storeAddress: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const store = await Store.findAll({
    limit: length,
    offset: start,
    where: where
  })
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


// Update Store Master Api

router.get('/updateStoreMaster/:id', checkUser, async function (req, res) {
  console.log(123)
  console.log(req.params.id)
  let store = await Store.findOne({where:{outletId :  req.params.id}})
  console.log(store)
  res.render('storeMasterUpdate', { title: 'Express', message: req.flash('message'),store });
});

router.post("/updateStore/:id", storeController.updateStore);


// Product Rate Api 

router.get('/productRaise', checkUser, async function (req, res) {

  const store = await Store.findAll()

  const product = await Product.findAll()

  res.render('productRaise', { title: 'Express', message: req.flash('message'), store, product });
});

router.post('/productRaise', productRaise.addProductRaise)


// Update Product Rate Api 

router.get('/updateProductRaise/:id', checkUser, async function (req, res) {
  console.log(123)
console.log(req.params.itemId)
  const store = await Store.findAll()

  const product = await Product.findAll()

  const productStock = await ProductStock.findOne({ where : { itemId :  req.params.id } })

  res.render('productRaiseUpdate', { title: 'Express', message: req.flash('message'), store, product,productStock });
});

router.post('/productRaise', productRaise.updateProductRaise)



// Stock In/Out Api

router.get('/stockInOut', checkUser, async function (req, res) {
  const store = await Store.findAll()
  const product = await Product.findAll()
  // console.log(product,store)  
  res.render('stockInOut', { title: 'Express', message: req.flash('message'), store, product });
});

router.post('/stockInOut', stockInOutController.stockInOut)




// Manufacturer Master Api

router.get('/manufacturer', checkUser, function (req, res) {
  res.render('manufacturer', { title: 'Express', message: req.flash('message') });
});

router.post('/addManufacturer', manufacturerController.addManufacturer)




// Manufacturer Listing Api

router.get('/manufacturerList', checkUser, function (req, res) {
  res.render('manufacturerList', { title: 'Express', message: req.flash('message') });
});

router.get('/manufacturerMasterList',  async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    console.log(req.query.search)
    where[Op.or] = [
      { shortDescription: { [Op.like]: `%${req.query.search.value}%` } },
      { longDescription: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const manufacturer = await Manufacturer.findAll({
    limit: length,
    offset: start,
    where: where
  })
  console.log(manufacturer)
  const count = await Manufacturer.count()
  console.log(count)

  let data_arr = []
  for (let i = 0; i <manufacturer.length; i++) {
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
  const manufacturer = await Manufacturer.findOne({ where  : { manufacturerId : req.params.id } } )
  res.render('manufacturerUpdate', { title: 'Express', message: req.flash('message'),manufacturer });
});

router.post('/updateManufacturer/:id', manufacturerController.updateManufacturer)


// Category Master Api

router.get('/category', checkUser, function (req, res) {
  res.render('category', { title: 'Express', message: req.flash('message') });
});

router.post('/addcategory', categoryController.addCategory)




// Category Listing Api

router.get('/categoryList', checkUser, function (req, res) {
  res.render('categoryList', { title: 'Express', message: req.flash('message') });
});

router.get('/categoryMasterList',  async function (req, res) {

  let draw = req.query.draw;

  let start = parseInt(req.query.start);

  let length = parseInt(req.query.length);

  let where = {}


  if (req.query.search.value) {
    console.log(req.query.search)
    where[Op.or] = [
      { shortDescription: { [Op.like]: `%${req.query.search.value}%` } },
      { longDescription: { [Op.like]: `%${req.query.search.value}%` } },
    ];
  }

  const category = await Category.findAll({
    limit: length,
    offset: start,
    where: where
  })
  console.log(category)
  const count = await Category.count()
  console.log(count)

  let data_arr = []
  for (let i = 0; i <category.length; i++) {
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
  console.log(123)
  console.log(req.params.categoryId)
  console.log(req.params.id)
  const category = await Category.findOne({ where : { categoryId : req.params.id } } )
  res.render('categoryUpdate', { title: 'Express', message: req.flash('message'),category });
});

router.post('/updateCategory/:id', categoryController.updateCategory)


// billing

router.get('/billing', checkUser, async function (req, res) {
  const product = await Product.findAll()
  const store=await Store.findAll()
 const productStock = await ProductStock.findAll()
  res.render('billing2', { title: 'Express', message: req.flash('message'), product, productStock,store});
});

// router.post('/submit', (req, res) => {
//   console.log(req.body)
//   res.redirect('/billing');
// });



const Order = db.order;
const OrderItems = db.orderItems;

router.post("/submit", async (req, res) => {
  try {
  // const customerPincode=document.getElementById("pincode").value;
  const { customerName, customerMobile, customerEmail,customerCity,customerState,customerPincode,customerPayment,products } = req.body;

    // Create an order with customer details
    const order = await Order.create({
      customerName,
      customerMobile,
      customerEmail,
      customerCity,
      customerState,
      customerPincode,
      customerPayment
      // ... Other customer details
    });

    // Create order items for each product
    const orderItems = products.map(product => ({
      orderPK: order.id,
      storeId:product.storeId,
      storeName:product.storeName,
      itemId: product.itemId,
      itemName: product.itemName,
      quantity: product.quantity,
      salePrice: product.price,
      discountPercentage: product.discount
      // ... Other product details
    }));

    // Bulk create order items
    await OrderItems.bulkCreate(orderItems);
    return res.status(200).json({ success: true, message: "Order items added successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
