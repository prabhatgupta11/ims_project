const express = require('express');
const db = require("../models")
const Product = db.products
const NewProduct = db.newProduct
const UserStoreMapping = db.userStoreMapping
const AutoGenerateNumber = db.autoGenerateNumber
const Store = db.store
const User = db.user

const xlsx = require('xlsx');
const Manufacturer = db.manufacturer
const CodeMaster = db.codeMaster
const TaxMaster = db.tax
const ProductImage = db.productImage
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();


// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Specify the directory to save the uploaded images
    },
    filename: (req, file, cb) => {
        const fileName = `${new Date().getTime()}_${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Create Product 

const createProduct = async (req, res) => {

    try {

        if (req.files) {
            const tmp_path = req.file.path;
            req.body.newFileName = `${new Date().getTime()}_${req.file.originalname}`
            /** The original name of the uploaded file
                stored in the variable "originalname". **/
            const target_path = `public/uploads/${req.body.newFileName}`;

            /** A better way to copy the uploaded file. **/
            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);
            src.on('end', function () { });
            src.on('error', function (err) { });
        }
        let info = {
            externalitemId: req.body.externalitemId,
            itemName: req.body.itemName,
            shortName: req.body.shortName,
            length: req.body.length,
            breadth: req.body.breadth,
            height: req.body.height,
            weight: req.body.weight,
            width: req.body.width,
            box: req.body.box,
            rack: req.body.rack,
            foodType: req.body.foodType,
            taxId: req.body.taxId,
            imageUrl: req.body.newFileName,
            decimalsAllowed: req.body.decimalsAllowed,
            status: req.body.status,
            itemProductTaxType: req.body.itemProductTaxType,
            fulfilmentMode: req.body.fulfilmentMode,
            isReturnable: req.body.isReturnable,
            isCancellable: req.body.isCancellable,
            returnPeriod: req.body.returnPeriod,
            description: req.body.description,
            detailedDescription: req.body.detailedDescription,
            weightGrams: req.body.weightGrams,
            appliesOnline: req.body.appliesOnline,
            itemProductType: req.body.itemProductType,
            itemTaxType: req.body.itemTaxType,
            iBarU: req.body.iBarU,
            manufacturerId: req.body.manufacturerId,
            pageN: req.body.pageN,
            isDeleted: req.body.isDeleted,
            approve_b: req.body.approve_b,
            approve_by: req.body.approve_by,
            approve_date: req.body.approve_date

        }
        const product = await Product.create(info)
        req.flash('message', 'Product sucessfully created wait for Approval');
        return res.redirect('/productMasterList')
    }
    catch (err) {
        console.log(err.message)
        req.flash('message', 'Something went wrong');
        return res.redirect('/product')
    }
}

// create New Product

const createNewProduct = async (req, res) => {
    const code = req.body.itemCode.split("/")
    const lastNo = code[1]

    // Update the lastno value in the database
    const updatedRefNum = await AutoGenerateNumber.update(
        { lastNo },
        { where: { prefix: code[0] } }
    );
    try {
        let info = {

            hsnCode: req.body.hsnCode,
            category: req.body.category,
            department: req.body.department,
            group: req.body.group,
            itemType: req.body.itemType,
            brand: req.body.brand,
            itemCode: req.body.itemCode,
            itemName: req.body.itemName,
            description: req.body.description,
            productType: req.body.productType,
            status: req.body.status,
            sellingPricePolicy: req.body.sellingPricePolicy,
            weight: req.body.weight,
            imageUrl: 'No',
            taxType: req.body.taxType,
            tax: req.body.tax,
            displayOrder: req.body.displayOrder,
            edit_by: req.body.edit_by,
            edit_on: req.body.edit_on,
            approve_b: req.body.approve_b,
            approved_by: req.body.approved_by,
            rowguid: req.body.rowguid,
        };

        const product = await NewProduct.create(info)

        // Image Name Save
        for (file of req.body.imageUrl) {
            await ProductImage.create({
                itemId: product.itemId,
                imageUrl: file,
            })
        }
        res.json(ok)

        req.flash('message', 'Product sucessfully created');
        return res.redirect('/newProductList')
    }
    catch (err) {
        console.log(err)
        req.flash('message', 'Something went wrong');
        return res.redirect('/newProduct');
    }
}

// create product api for app

const createAppProduct = async (req, res) => {
    try {

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

        if(!req.body.imageUrl){
            req.body.imageUrl = ''
        }

        if (!req.body.hsnCode || !req.body.category || !req.body.department || !req.body.group || !req.body.brand || !req.body.hsnCode || !req.body.itemName || !req.body.weight || !req.body.tax) {
            return res.status(500).json({
                success: false,
                message: "Please fill all the required fields"
            })
        }

        const info = {
            hsnCode: req.body.hsnCode,
            category: req.body.category,
            department: req.body.department,
            group: req.body.group,
            itemType: req.body.itemType,
            brand: req.body.brand,
            itemCode: generateCode,
            itemName: req.body.itemName,
            description: req.body.description,
            productType: req.body.productType,
            status: req.body.status,
            sellingPricePolicy: req.body.sellingPricePolicy,
            weight: req.body.weight,
            imageUrl: '',
            taxType: req.body.taxType,
            tax: req.body.tax,
            displayOrder: req.body.displayOrder,
            edit_by: req.body.edit_by,
            edit_on: req.body.edit_on,
            approve_b: req.body.approve_b,
            approved_by: req.body.approved_by,
            rowguid: req.body.rowguid,
        };

        const product = await NewProduct.create(info);

        // Image Name Save
        for (const file of req.body.imageUrl) {
            await ProductImage.create({
                itemId: product.itemId,
                imageUrl: file,
            });
        }

        // Sending a JSON response instead of using flash messages and redirects
        return res.status(200).json({
            success: true,
            message: 'Product successfully created',
            product: product
        });
    } catch (err) {
        console.log(err);
        // Sending a JSON response instead of using flash messages and redirects
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};



// Update Product Details

const updateProduct = async (req, res) => {
    try {
        const product = await Product.update({ ...req.body, approve_b: 'pending' }, { where: { itemId: req.params.id } })

        if (!product) {
            req.flash('message', 'Product not found');
        }

        req.flash('message', 'Product Details updated sucessfully wait for approval');
        return res.redirect('/productMasterList')

    } catch (err) {
        console.log(err.message)
        req.flash('message', 'Something went wrong');
        return res.redirect('/updateProduct/:id')
    }


}

const updateNewProduct = async (req, res) => {

    try {

        await NewProduct.update({ ...req.body, approve_b: 'pending', imageUrl: req.body.newFileName }, { where: { rowguid: req.params.id } })

        req.flash('message', 'Product Details updated sucessfully');
        return res.redirect('/newProductList')

    } catch (err) {
        console.log(err)
        req.flash('message', 'Something went wrong');
        return res.redirect(`/updateNewProduct/${req.params.id}`)
    }


}

// update product api for app

const updateAppProduct = async (req, res) => {
    try {

        if(!req.body.imageUrl){
            req.body.imageUrl = ''
        }

        if (!req.body.hsnCode || !req.body.category || !req.body.category || !req.body.department || !req.body.group || !req.body.brand || !req.body.hsnCode || !req.body.itemName || !req.body.weight || !req.body.tax) {
            return res.status(500).json({
                success: false,
                message: "Please fill all the required fields"
            })
        }

        const product = await NewProduct.findOne({ where: { rowguid: req.params.id } })

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updatedProduct = await product.update(
            { ...req.body, approve_b: 'pending', imageUrl: ""}
        );

        // Sending a JSON response instead of using flash messages and redirects
        return res.status(200).json({
            success: true,
            message: 'Product details updated successfully',
            product: updatedProduct
        });
    } catch (err) {
        console.log(err);

        // Sending a JSON response instead of using flash messages and redirects
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};




// upload bulk products

const uploadBulkProduct = async function (req, res) {
    try {
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

                let manufacturer = await Manufacturer.findOne({ where: { shortDescription: productData.manufacturer } });

                if (!manufacturer) {
                    manufacturer = await Manufacturer.create({ shortDescription: productData.manufacturer });
                }

                // Create the product with the manufacturer ID
                await Product.create({
                    externalitemId: productData.externalitemId,
                    itemName: productData.itemName,
                    shortName: productData.shortName,
                    length: productData.length,
                    breadth: productData.breadth,
                    height: productData.height,
                    weight: productData.weight,
                    width: productData.width,
                    box: productData.box,
                    rack: productData.rack,
                    foodType: productData.foodType,
                    taxId: productData.taxId,
                    imageUrl: newFileName,
                    decimalsAllowed: productData.decimalsAllowed,
                    status: productData.status,
                    itemProductTaxType: productData.itemProductTaxType,
                    fulfilmentMode: productData.fulfilmentMode,
                    isReturnable: productData.isReturnable,
                    isCancellable: productData.isCancellable,
                    returnPeriod: productData.returnPeriod,
                    description: productData.description,
                    detailedDescription: productData.detailedDescription,
                    weightGrams: productData.weightGrams,
                    appliesOnline: productData.appliesOnline,
                    itemProductType: productData.itemProductType,
                    itemTaxType: productData.itemTaxType,
                    iBarU: productData.iBarU,
                    manufacturerId: manufacturer.manufacturerId,
                    pageN: productData.pageN,
                    // isDeleted: productData.isDeleted,
                    // approve_b: productData.approve_b,
                    // approve_by: productData.approve_by,
                    // approve_date: productData.approve_date,
                });
            }

            req.flash('message', 'Products Successfully Uploaded.');
            return res.redirect('/productMasterList');
        }
    } catch (err) {
        console.log(err.message);
        req.flash('message', 'Something went wrong');
        return res.redirect('/uploadBulkProducts');
    }
};

// Upload bulk products module

const uploadBulkProducts = async (req, res) => {
    try {
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

            req.flash('message', 'Products Successfully Uploaded.');
            return res.redirect('/newProductList');
        }
    } catch (err) {
        console.log(err);
        req.flash('message', 'Something went wrong');
        return res.redirect('/uploadBulkProducts');
    }
}

// product approval list

const productApprovalList = async function (req, res) {

    const userId = req.session.userDetail.id
    const user = await User.findOne({ where: { id: userId } })
    const storeMapping = await UserStoreMapping.findOne({ where: { userFk: userId } })
    const store = await Store.findOne({ where: { outletId: storeMapping.storeFk } })
    if (store.storeName == 'Head Office' || user.managerFk == -1) {
        const approvalStatus = req.query.approvalStatus; // Get the approval status from query parameter

        let whereClause = {};

        if (approvalStatus === 'pending') {
            whereClause = { approve_b: 'pending' };
        } else if (approvalStatus === 'approved') {
            whereClause = { approve_b: "approved" };
        } else if (approvalStatus === 'rejected') {
            whereClause = { approve_b: "rejected" };
        }

        const product = await NewProduct.findAll({ where: whereClause });

        return res.render('approval/productApprovalList', { title: 'Express', message: req.flash('message'), product });
    }
    req.flash('message', 'You Can Not Access This Page Only Head Office Can Access This')
    return res.redirect('/')
}

const updateProductApprovalStatus = async (req, res) => {
    const { action, selectedItemIds } = req.body;
    const flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const itemId of selectedItemIds) {

                const product = await NewProduct.findOne({ where: { itemId: itemId } });

                if (product) {
                    await NewProduct.update({ approve_b: action }, { where: { itemId: itemId } });
                    flashMessages.push(`Item ID ${itemId} ${action}`);
                }
            }

            if (flashMessages.length > 0) {
                req.flash('message', flashMessages.join(', '));
            } else {
                req.flash('message', 'No approval requests were updated.');
            }

            return res.redirect('/productApprovalList');
        } catch (err) {
            console.error(err.message);
            req.flash('message', 'Something went wrong');
            return res.redirect('/productApprovalList');
        }
    }
}


// product approval list

const newProductApprovalList = async function (req, res) {
    const userId = req.session.userDetail.id
    const user = await User.findOne({ where: { id: userId } })
    const storeMapping = await UserStoreMapping.findOne({ where: { userFk: userId } })
    const store = await Store.findOne({ where: { outletId: storeMapping.storeFk } })
    if (store.storeName == 'Head Office' || user.managerFk == -1) {
        return res.render('approval/newProductApprovalList', { title: 'Express', message: req.flash('message') });
    }
    req.flash('message', 'You Can Not Access This Page Only Head Office Can Access This')
    return res.redirect('/')

}

const updateNewProductApprovalStatus = async (req, res) => {
    let draw = req.body.draw;
    let start = parseInt(req.body.start);
    let length = parseInt(req.body.length);
    let approvalStatus = req.body.approvalStatus;  // Retrieve outletId from the request

    let where = {};

    if (req.body.search.value) {
        where[Op.or] = [
            { itemName: { [Op.like]: `%${req.body.search.value}%` } },
            { approve_b: { [Op.like]: `%${req.body.search.value}%` } },
        ];
    }

    const product = await NewProduct.findAll({
        where: { ...where, approve_b: approvalStatus },
        limit: length,
        offset: start
    });
    const count = await NewProduct.count({ where: { approve_b: approvalStatus } })

    let arr = [];



    for (let i = 0; i < product.length; i++) {

        arr.push({
            'itemName': product[i].itemName,
            'status': product[i].approve_b,
            'itemId': product[i].itemId,
            'rowguid': product[i].rowguid
        });
    }
    let output = {
        'draw': draw,
        'iTotalRecords': count,
        'iTotalDisplayRecords': count,
        'aaData': arr
    };

    res.json(output);

}


const updateApprovalStatusOfProduct = async (req, res) => {

    const { products, action } = req.body;

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const itemId of products) {

                const product = await NewProduct.findOne({ where: { rowguid: itemId } });

                if (product) {
                    await NewProduct.update({ approve_b: action }, { where: { rowguid: itemId } });
                }

            }
            return req.flash('message', `Selected Item are ${action}`)
        } catch (err) {
            console.log(err);
            req.flash('message', 'Please Select any check box for action');
            return res.redirect('/newProductApprovalList');
        }
    }
}








module.exports = {
    updateProduct,
    updateNewProduct,
    createNewProduct,
    createAppProduct,
    createProduct,
    updateProduct,
    updateNewProduct,
    updateAppProduct,
    productApprovalList,
    updateProductApprovalStatus,
    newProductApprovalList,
    updateNewProductApprovalStatus,
    updateApprovalStatusOfProduct,
    uploadBulkProducts

}