const db = require("../models")
const StockInOut = db.stockInOut
const ProductStock = db.productStock


const stockInOut = async (req, res) => {
    console.log(req.body.type)
    try {

        const product = await ProductStock.findOne({ where: { itemId: req.body.itemId } })

        if (!product) {
            return res.status(500).send({
                success: false,
                message: "Product is not found in Product Stock"
            })
        }

        const store = await ProductStock.findOne({ where: { outletId: req.body.outletId } })


        if (!store) {
            return res.status(500).send({
                success: false,
                message: "Store is not found in Product Stock"
            })
        }
        const qty = parseInt(req.body.qty)

        const productStock = await ProductStock.findOne({ where: { itemid: req.body.itemId, outletId: req.body.outletId } })

        if (req.body.type == 'in') {

            const addproductStock = await ProductStock.update({ stock: productStock.stock + qty }, { where: { itemId: req.body.itemId, outletId: req.body.outletId } })

        } else if (req.body.type == 'out') {
            
            const removeProductStock = await ProductStock.update({ stock: productStock.stock - qty }, { where: { itemId: req.body.itemId, outletId: req.body.outletId } })

        }

        const info = {
            itemId: req.body.itemId,
            outletId: req.body.outletId,
            type: req.body.type,
            qty: req.body.qty,
            remarks: req.body.remarks
        }

        const stockInOut = await StockInOut.create(info)
        req.flash('message', 'Stock updated sucessfully');
        return res.redirect('/productDetailsList')

    }

    catch (err) {
        console.log(err.message)
        res.status(500).send({
            success: false,
            message: "something went wrong",
        })
        console.log(err)
    }

}
module.exports = {
    stockInOut
}