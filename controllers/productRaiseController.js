const db = require("../models")
const ProductRaise = db.productRaise;
const ProductStock = db.productStock;



const addProductRaise = async (req, res) => {

    try {


        if(req.body.store_selection == 'applied_to_all'){
            console.log(123)
            const sameProductPriceForAllStore = await ProductStock.update({ mrp: req.body.mrp, salePrice: req.body.price }, { where: { itemId: req.body.itemId} })
        }


        const productStock = await ProductStock.findOne({ where: { itemId: req.body.itemId, outletId: req.body.outletId } })


        if (!productStock) {
            return res.status(500).send({
                success: false,
                message: "ProductStock is not found"
            })
        }

        const addMrpPriceInStock = await ProductStock.update({ mrp: req.body.mrp, salePrice: req.body.price }, { where: { itemId: req.body.itemId, outletId: req.body.outletId } })


        const info = {
            itemId: req.body.itemId,
            outletId: req.body.outletId,
            mrp: req.body.mrp,
            price: req.body.price
        }

        const addProductRaise = await ProductRaise.create(info)

        req.flash('message', 'MRP and Price Added.');
        return res.redirect('/productDetailsList')

    }

    catch (err) {
        res.status(500).send({
            success: false,
            message: "something went wrong"
        })
        console.log(err)
    }

}

const updateProductRaise = async (req, res) => {

    console.log(123)
    console.log(req.params.id)
    try {

        const productStock = await ProductStock.update({ ...req.body, mrp: req.body.mrp, salePrice: req.body.price }, { where: { itemId: req.params.id } })
        
        if (!productStock) {
            return res.status(500).send({
                success: false,
                message: "ProductStock is not found"
            })
        }

        req.flash('message', 'MRP and Price Updated.');
        return res.redirect('/productDetailsList')

    }

    catch (err) {
        console.log(err.message)
        res.status(500).send({
            success: false,
            message: "something went wrong"
        })
        console.log(err)
    }

}

module.exports = {
    addProductRaise,
    updateProductRaise
}