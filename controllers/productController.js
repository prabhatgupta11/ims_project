const db = require("../models")
const Product = db.products
const fs = require('fs');

// Create Product
const createProduct = async (req, res) => {
console.log(req.body.manufacturerId)
    try {
        if (req.file) {
            const tmp_path = req.file.path;
            console.log(tmp_path)
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
            isDeleted: req.body.isDeleted
        }

        // const productStock = await productStock.create()

        const product = await Product.create(info)
        req.flash('message', 'Product Sucessfully Created.');
        return res.redirect('/productMasterList')
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({
            success: false,
            message: "something went wrong"
        })
    }
}


// Get All Product Details
const getAllProduct = async (req, res) => {
    const page = req.query.page ? req.query.page : 1
    const size = req.query.size ? req.query.size : 3
    const products = await Product.findAndCountAll({
        limit: size,
        offset: (page - 1) * size
    })

    return res.status(200).send({
        success: true,
        products
    })
}

// Get Single Product Details
const getSingleProduct = async (req, res) => {
    const product = await Product.findOne({ where: { id: req.params.id } })
    if (!product) {
        res.status(200).send({
            success: false,
            message: "Product Not Found"
        })
    }
    res.status(200).send({
        success: true,
        product
    })
}

// Update Product Details
const updateProduct = async (req, res) => {
    console.log(123)
    try {
        if (req.file) {
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

        const product = await Product.update( { ...req.body, imageUrl: req.body.newFileName }, { where: { itemId: req.params.id } })

        if (!product) {
            res.status(200).send({
                success: false,
                message: "Product Not Found"
            })
        }

        req.flash('message', 'Product Details updated sucessfully');
        return res.redirect('/productMasterList')

    } catch (err) {
        console.log(err.message)
        res.status(500).send({
            success: false,
            message: "something went wrong"
        })
    }


}

// Delete Product Details
const deleteProduct = async (req, res) => {
    const product = await Product.destroy({ where: { id: req.params.id } })
    if (!product) {
        res.status(200).send({
            success: false,
            message: "Product Not Found"
        })
    }
    res.status(200).send({
        message: "Product Deleted Sucessfully"
    })
}




module.exports = {
    updateProduct,
    createProduct,
    getAllProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct
}