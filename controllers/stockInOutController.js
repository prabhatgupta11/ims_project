const db = require("../models")
const StockInOut = db.stockInOut
const ProductStock = db.productStock
const ProductPrice = db.productPrice
const Order = db.order



//  create stock In Details

const addStockIn = async (req, res) => {
    try {

        const {
            stockType,
            referenceNumber,
            orderDate,
            outletId,
            supplierCustomer,
            name,
            email,
            mobileNo,
            remarks,
            itemId,
            hsnCode,
            batchNo,
            mfgDate,
            expDate,
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePrice,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal
        } = req.body

        // console.log(888888888,req.body)
        // Create an order with customer details
        const order = await Order.create({
            stockType: stockType,
            outletId: outletId,
            referenceNumber: referenceNumber,
            orderDate: orderDate,
            customerName: name,
            customerMobile: mobileNo,
            customerEmail: email,
            remarks: remarks,
            totalAmount: grandTotal
        });

        let products = []
        // Loop through the items (assuming itemId is a unique identifier for each product)
        for (let i = 0; i < itemId.length; i++) {

            const product = {
                outletId: outletId,
                stockType: stockType,
                supplierCustomer: supplierCustomer,
                itemId: itemId[i],
                hsnCode: hsnCode[i],
                batchNo: batchNo[i],
                mfgDate: mfgDate[i],
                expDate: expDate[i],
                freeQty: freeQty[i],
                qty: qty[i],
                purchasePrice: purchasePrice[i],
                discountType: discountType[i],
                discount: discount[i],
                originalPrice: originalPrice[i],
                mrp: mrp[i],
                salePrice: salePrice[i],
                costPriceWithoutTax: costPriceWithoutTax[i],
                taxPercentage: taxPercentage[i],
                taxAmount: taxAmount[i],
                packing: packing[i],
                pack: pack[i],
                totalAmount: totalAmount[i]
            };
            products.push(product);

        }
        // console.log(11111111,products)
        // Create order items for each product
        const orderItems = products.map(product => ({
            orderFk: order.orderId,
            outletId: product.outletId,
            itemId: product.itemId,
            stockType: stockType,
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
            salePrice: product.salePrice,
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
        req.flash('message', 'Stock Added Successfully')
        return res.redirect('/stockInList')

    } catch (err) {
        console.log(err)
        req.flash('message', 'Something Went Wrong')
        return res.redirect('/stockIn')
    }

}

// update stock In module
const updateStockIn = async (req, res) => {
    try {

        // Existing product details
        const orderUpdate = await Order.findOne({ where: { rowguid: req.params.id } });
        const productPrice = await ProductPrice.findAll({ where: { orderFk: orderUpdate.orderId } });
        let pRowguid = []
        pRowguid = productPrice.map(mapping => mapping.rowguid)
        const {
            stockType,
            referenceNumber,
            orderDate,
            outletId,
            supplierCustomer,
            name,
            email,
            mobileNo,
            remarks,
            itemId,
            hsnCode,
            batchNo,
            mfgDate,
            expDate,
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePrice,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal
        } = req.body;
        // Add pRowguid to the req.body
        req.body.pRowguid = pRowguid;
       
        // Create an order with customer details if needed
        const order = await Order.update(
            {
                stockType: stockType,
                outletId: outletId,
                referenceNumber: referenceNumber,
                orderDate: orderDate,
                customerName: name,
                customerMobile: mobileNo,
                customerEmail: email,
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
            const product = {
                orderFk: orderUpdate.orderId,
                outletId: outletId,
                stockType: stockType,
                supplierCustomer: supplierCustomer,
                itemId: itemId[i],
                hsnCode: hsnCode[i],
                batchNo: batchNo[i],
                mfgDate: mfgDate[i],
                expDate: expDate[i],
                freeQty: freeQty[i],
                qty: qty[i],
                purchasePrice: purchasePrice[i],
                discountType: discountType[i],
                discount: discount[i],
                originalPrice: originalPrice[i],
                mrp: mrp[i],
                salePrice: salePrice[i],
                costPriceWithoutTax: costPriceWithoutTax[i],
                taxPercentage: taxPercentage[i],
                taxAmount: taxAmount[i],
                packing: packing[i],
                pack: pack[i],
                totalAmount: totalAmount[i],
                rowguid: pRowguid[i] || generateRowguid(),
                approve_b: 'pending'
            };

            // Check if the product already exists based on itemId and outletId
            const existingProduct = await ProductPrice.findOne({
                where: {rowguid: product.rowguid },
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

        req.flash('message', 'Stock Updated Successfully');
        return res.redirect('/stockInList');
    } catch (err) {
        console.log(err);
        req.flash('message', 'Something Went Wrong');
        return res.redirect('/stockInOrder');
    }
};



// Stock In Approval Module

const stockInApprovalList = async function (req, res) {

    const approvalStatus = req.query.approvalStatus; // Get the approval status from query parameter

    let whereClause = {};

    if (approvalStatus === 'pending') {
        whereClause = { approve_b: 'pending' };
    } else if (approvalStatus === 'approved') {
        whereClause = { approve_b: "approved" };
    } else if (approvalStatus === 'rejected') {
        whereClause = { approve_b: "rejected" };
    }

    const stockInOut = await Order.findAll({ where: { ...whereClause, stockType: 'In' } });
    res.render('approval/stockInApprovalList', { title: 'Express', message: req.flash('message'), stockInOut });
}

const updateStockInApprovalStatus = async (req, res) => {
    const { action, selectedItemIds } = req.body;
    let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of selectedItemIds) {
                await processApproval(orderId, action);
            }

            if (flashMessages.length > 0) {
                req.flash('message', flashMessages.join(', '));
            } else {
                req.flash('message', 'No approval requests were updated.');
            }

            return res.redirect('/stockInApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockInApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });

        if (order) {
            await Order.update({ approve_b: action }, { where: { orderId: orderId } });

            const productPrices = await ProductPrice.findAll({ where: { orderFk: orderId } });

            for (const stockInOut of productPrices) {
                // Check if stockInOut data exists
                // const existingStockInOut = await StockInOut.findOne({
                //     where: {
                //         itemId: stockInOut.itemId,
                //         outletId: stockInOut.outletId,
                //         batchNo:stockInOut.batchNo
                //     },
                // });

                // if (existingStockInOut) {
                //     // Update stockInOut data
                //     await existingStockInOut.update({
                //         type: stockInOut.stockType,
                //         qty: stockInOut.qty,
                //         remarks: order.remarks,
                //         batchNo: stockInOut.batchNo,
                //         expDate: stockInOut.expDate,
                //         productHsnCode: stockInOut.hsnCode,
                //     });
                // } else {
                // Create stockInOut data
                await StockInOut.create({
                    itemId: stockInOut.itemId,
                    outletId: stockInOut.outletId,
                    type: stockInOut.stockType,
                    qty: stockInOut.qty,
                    remarks: order.remarks,
                    batchNo: stockInOut.batchNo,
                    expDate: stockInOut.expDate,
                    productHsnCode: stockInOut.hsnCode,
                }, {
                    where: {
                        itemId: stockInOut.itemId,
                        outletId: stockInOut.outletId,
                        batchNo: stockInOut.batchNo
                    },
                });
            }
            // }

            flashMessages.push(`Checked Id ${orderId} ${action}`);
        }
    }
}


//Create Stock Out Details

const addStockOut = async (req, res) => {
    try {

        const {
            stockType,
            referenceNumber,
            orderDate,
            outletId,
            supplierCustomer,
            name,
            email,
            mobileNo,
            remarks,
            itemId,
            hsnCode,
            batchNo,
            mfgDate,
            expDate,
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePrice,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal
        } = req.body

        // console.log(888888888,req.body)
        // Create an order with customer details
        const order = await Order.create({
            stockType: stockType,
            outletId: outletId,
            referenceNumber: referenceNumber,
            orderDate: orderDate,
            customerName: name,
            customerMobile: mobileNo,
            customerEmail: email,
            remarks: remarks,
            totalAmount: grandTotal
        });

        let products = []
        // Loop through the items (assuming itemId is a unique identifier for each product)
        for (let i = 0; i < itemId.length; i++) {

            const product = {
                outletId: outletId,
                stockType: stockType,
                supplierCustomer: supplierCustomer,
                itemId: itemId[i],
                hsnCode: hsnCode[i],
                batchNo: batchNo[i],
                mfgDate: mfgDate[i],
                expDate: expDate[i],
                freeQty: freeQty[i],
                qty: qty[i],
                purchasePrice: purchasePrice[i],
                discountType: discountType[i],
                discount: discount[i],
                originalPrice: originalPrice[i],
                mrp: mrp[i],
                salePrice: salePrice[i],
                costPriceWithoutTax: costPriceWithoutTax[i],
                taxPercentage: taxPercentage[i],
                taxAmount: taxAmount[i],
                packing: packing[i],
                pack: pack[i],
                totalAmount: totalAmount[i]
            };
            products.push(product);

        }
        // console.log(11111111,products)
        // Create order items for each product
        const orderItems = products.map(product => ({
            orderFk: order.orderId,
            outletId: product.outletId,
            itemId: product.itemId,
            stockType: stockType,
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
            salePrice: product.salePrice,
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
        req.flash('message', 'Stock Out Details Added Successfully')
        return res.redirect('/stockOutList')

    } catch (err) {
        console.log(err)
        req.flash('message', 'Something Went Wrong')
        return res.redirect('/stockOut')
    }

}

// update stock In module
const updateStockOut = async (req, res) => {

    try {
        // Existing product details
        const orderUpdate = await Order.findOne({ where: { rowguid: req.params.id } });
        const productPrice = await ProductPrice.findAll({ where: { orderFk: orderUpdate.orderId } });
        let pRowguid = []
        pRowguid = productPrice.map(map => map.rowguid)
        const {
            stockType,
            referenceNumber,
            orderDate,
            outletId,
            supplierCustomer,
            name,
            email,
            mobileNo,
            remarks,
            itemId,
            hsnCode,
            batchNo,
            mfgDate,
            expDate,
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePrice,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal
        } = req.body;
        // add extra field
        req.body.pRowguid = pRowguid
        // Create an order with customer details if needed
        const order = await Order.update(
            {
                stockType: stockType,
                outletId: outletId,
                referenceNumber: referenceNumber,
                orderDate: orderDate,
                customerName: name,
                customerMobile: mobileNo,
                customerEmail: email,
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
            const product = {
                orderFk: productPrice.orderId,
                outletId: outletId,
                stockType: stockType,
                supplierCustomer: supplierCustomer,
                itemId: itemId[i],
                hsnCode: hsnCode[i],
                batchNo: batchNo[i],
                mfgDate: mfgDate[i],
                expDate: expDate[i],
                freeQty: freeQty[i],
                qty: qty[i],
                purchasePrice: purchasePrice[i],
                discountType: discountType[i],
                discount: discount[i],
                originalPrice: originalPrice[i],
                mrp: mrp[i],
                salePrice: salePrice[i],
                costPriceWithoutTax: costPriceWithoutTax[i],
                taxPercentage: taxPercentage[i],
                taxAmount: taxAmount[i],
                packing: packing[i],
                pack: pack[i],
                totalAmount: totalAmount[i],
                rowguid: pRowguid[i] || generateRowguid(),
                approve_b: 'pending'
            };

            // Check if the product already exists based on itemId and outletId
            const existingProduct = await ProductPrice.findOne({
                where: {rowguid: product.rowguid },
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

        req.flash('message', 'Stock Out Updated Successfully');
        return res.redirect('/stockOutList');
    } catch (err) {
        console.log(err);
        req.flash('message', 'Something Went Wrong');
        return res.redirect('/stockOut');
    }
};


// Stock Out Approval Module

const stockOutApprovalList = async function (req, res) {

    const approvalStatus = req.query.approvalStatus; // Get the approval status from query parameter

    let whereClause = {};

    if (approvalStatus === 'pending') {
        whereClause = { approve_b: 'pending' };
    } else if (approvalStatus === 'approved') {
        whereClause = { approve_b: "approved" };
    } else if (approvalStatus === 'rejected') {
        whereClause = { approve_b: "rejected" };
    }

    const stockInOut = await Order.findAll({ where: { ...whereClause, stockType: 'Out' } });
    res.render('approval/stockOutApprovalList', { title: 'Express', message: req.flash('message'), stockInOut });
}

const updateStockOutApprovalStatus = async (req, res) => {
    const { action, selectedItemIds } = req.body;
    let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of selectedItemIds) {
                await processApproval(orderId, action);
            }

            if (flashMessages.length > 0) {
                req.flash('message', flashMessages.join(', '));
            } else {
                req.flash('message', 'No approval requests were updated.');
            }

            return res.redirect('/stockOutApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockOutApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });

        if (order) {
            await Order.update({ approve_b: action }, { where: { orderId: orderId } });

            const productPrices = await ProductPrice.findAll({ where: { orderFk: orderId } });

            for (const stockInOut of productPrices) {
                // Check if stockInOut data exists
                // const existingStockInOut = await StockInOut.findOne({
                //     where: {
                //         itemId: stockInOut.itemId,
                //         outletId: stockInOut.outletId,
                //         batchNo:stockInOut.batchNo
                //     },
                // });

                // if (existingStockInOut) {
                //     // Update stockInOut data
                //     await existingStockInOut.update({
                //         type: stockInOut.stockType,
                //         qty: stockInOut.qty,
                //         remarks: order.remarks,
                //         batchNo: stockInOut.batchNo,
                //         expDate: stockInOut.expDate,
                //         productHsnCode: stockInOut.hsnCode,
                //     });
                // } else {
                // Create stockInOut data
                await StockInOut.create({
                    itemId: stockInOut.itemId,
                    outletId: stockInOut.outletId,
                    type: stockInOut.stockType,
                    qty: stockInOut.qty,
                    remarks: order.remarks,
                    batchNo: stockInOut.batchNo,
                    expDate: stockInOut.expDate,
                    productHsnCode: stockInOut.hsnCode,
                }, {
                    where: {
                        itemId: stockInOut.itemId,
                        outletId: stockInOut.outletId,
                        batchNo: stockInOut.batchNo
                    },
                });
            }
            // }

            flashMessages.push(`Checked Id ${orderId} ${action}`);
        }
    }
}






// Create stock in/out product stock 

const stockInOut = async (req, res) => {

    try {

        const productStock = await ProductStock.findOne({ where: { itemId: req.body.itemId, outletId: req.body.outletId } })

        if (productStock) {
            const qty = parseInt(req.body.qty)

            if (req.body.type == 'in') {

                const addproductStock = await ProductStock.update({ approve_b: 'pending', stock: (productStock.stock) + qty }, { where: { itemId: req.body.itemId, outletId: req.body.outletId } })
                req.flash('message', 'Stock successfully added into product stock');

            } else if (req.body.type == 'out') {

                const removeProductStock = await ProductStock.update({ approve_b: 'pending', stock: (productStock.stock) - qty }, { where: { itemId: req.body.itemId, outletId: req.body.outletId } })
                req.flash('message', 'Stock successfully out from product stock');
            }

            const info = {
                itemId: req.body.itemId,
                outletId: req.body.outletId,
                type: req.body.type,
                qty: req.body.qty,
                remarks: req.body.remarks,
                approve_b: req.body.approve_b,
                approve_by: req.body.approve_by,
                approve_date: req.body.approve_date
            }

            const stockInOut = await StockInOut.create(info)
            return res.redirect('/productDetailsList')

        } else {
            req.flash('message', 'Product is not available into product stock');
            return res.redirect('/stockInOut')
        }
    }
    catch (err) {
        console.log(err)
        req.flash('message', 'Something went wrong');
        return res.redirect('/stockInOut')
    }

}


// stockInOut approval

const stockInOutApprovalList = async function (req, res) {

    const approvalStatus = req.query.approvalStatus; // Get the approval status from query parameter

    let whereClause = {};

    if (approvalStatus === 'pending') {
        whereClause = { approve_b: 'pending' };
    } else if (approvalStatus === 'approved') {
        whereClause = { approve_b: "approved" };
    } else if (approvalStatus === 'rejected') {
        whereClause = { approve_b: "rejected" };
    }

    const stockInOut = await StockInOut.findAll({ where: whereClause });

    res.render('approval/stockInOutApprovalList', { title: 'Express', message: req.flash('message'), stockInOut });
}


const updateStockInOutApprovalStatus = async (req, res) => {
    const { action, selectedItemIds } = req.body;

    const flashMessages = []

    if (action === 'approved' || action === 'rejected') {
        try {

            for (const itemId of selectedItemIds) {

                const stockInOut = await StockInOut.findOne({ where: { itemId: itemId } });
                const productStock = await ProductStock.findOne({ where: { itemId: itemId } });

                if (stockInOut && productStock) {

                    await StockInOut.update({ approve_b: action }, { where: { itemId: stockInOut.itemId, outletId: stockInOut.outletId } });
                    await ProductStock.update({ approve_b: action }, { where: { itemId: stockInOut.itemId, outletId: stockInOut.outletId } });

                    flashMessages.push(`checked Id ${itemId} ${action}`)
                }
            }
            if (flashMessages.length > 0) {
                req.flash('message', flashMessages.join(', '));
            } else {
                req.flash('message', 'No approval requests were updated.');
            }

            return res.redirect('/stockInOutApprovalList');
        } catch (err) {

            console.error(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockInOutApprovalList');
        }
    }
}

module.exports = {
    addStockIn,
    updateStockIn,
    stockInApprovalList,
    updateStockInApprovalStatus,
    addStockOut,
    updateStockOut,
    stockOutApprovalList,
    updateStockOutApprovalStatus,
    stockInOut,
    stockInOutApprovalList,
    updateStockInOutApprovalStatus,
}