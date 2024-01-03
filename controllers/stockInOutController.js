const db = require("../models")
const StockInOut = db.stockInOut
const ProductStock = db.productStock
const ProductPrice = db.productPrice
const PurchaseOrder = db.purchaseOrder
const PurchaseOrderItems = db.purchaseOrderItems
const Order = db.order
const SaleQuotation = db.saleQuotation
const SaleQuotationItem = db.saleQuotationItem
const Store = db.store
const UserStoreMapping = db.userStoreMapping
const AutoGenerateNumber = db.autoGenerateNumber
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


//  create purchase Order
const createPurchaseOrder = async (req, res) => {

    const code = req.body.purchaseOrderNo.split("/")
    const lastNo = code[1]

    // Update the lastno value in the database
    const updatedRefNum = await AutoGenerateNumber.update(
        { lastNo },
        { where: { prefix: code[0], suffix: code[2] } }
    );
    try {

        const {
            stockType,
            purchaseOrderNo,
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
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePriceInclTax,
            salePriceExclTax,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal
        } = req.body

        const userId = req.session.userDetail.id

        // console.log(888888888,req.body)
        // Create an order with customer details
        const order = await PurchaseOrder.create({
            stockType: stockType,
            outletId: outletId,
            purchaseOrderNo: purchaseOrderNo,
            orderDate: orderDate,
            customerName: name,
            customerMobile: mobileNo,
            customerEmail: email,
            remarks: remarks,
            totalAmount: grandTotal,
            userId: userId
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
                salePriceInclTax: salePriceInclTax[i],
                salePriceExclTax: salePriceExclTax[i],
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

        const stockIn = await PurchaseOrderItems.bulkCreate(orderItems)
        // console.log(stockIn)
        req.flash('message', 'Stock Added Successfully')
        return res.redirect('/purchaseOrderList')

    } catch (err) {
        console.log(err)
        req.flash('message', 'Something Went Wrong')
        return res.redirect('/createPurchaseOrder')
    }

}

// update purchase order
const updatePurchaseOrder = async (req, res) => {
    try {

        // Existing product details
        const orderUpdate = await PurchaseOrder.findOne({ where: { rowguid: req.params.id } });
        const productPrice = await PurchaseOrderItems.findAll({ where: { orderFk: orderUpdate.orderId } });
        let pRowguid = []
        pRowguid = productPrice.map(mapping => mapping.rowguid)
        const {
            stockType,
            purchaseOrderNo,
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
            salePriceInclTax,
            salePriceExclTax,
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
        const order = await PurchaseOrder.update(
            {
                stockType: stockType,
                outletId: outletId,
                purchaseOrderNo: purchaseOrderNo,
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
                salePriceInclTax: salePriceInclTax[i],
                salePriceExclTax: salePriceExclTax[i],
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
            const existingProduct = await PurchaseOrderItems.findOne({
                where: { rowguid: product.rowguid },
            });

            if (existingProduct) {
                // If it exists, update the existing record
                await existingProduct.update(product);
                updatedProducts.push(existingProduct);
            } else {
                // If it doesn't exist, create a new record
                const newProduct = await PurchaseOrderItems.create(product);
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
        return res.redirect('/purchaseOrderList');
    } catch (err) {
        console.log(err);
        req.flash('message', 'Something Went Wrong');
        return res.redirect(`/purchaseOrderUpdate/${req.params.id}`);
    }
};



// //  create stock In Details
// const addStockIn = async (req, res) => {

//     const code=req.body.referenceNumber.split("/")
//     const lastNo=code[1]

//      // Update the lastno value in the database
//      const updatedRefNum = await AutoGenerateNumber.update(
//       { lastNo },
//       { where: { prefix: code[0] }}
//     );
//     try {

//         const {
//             stockType,
//             referenceNumber,
//             orderDate,
//             outletId,
//             supplierCustomer,
//             name,
//             email,
//             mobileNo,
//             paymentStatus,
//             paymentMode,
//             remarks,
//             itemId,
//             hsnCode,
//             batchNo,
//             mfgDate,
//             expDate,
//             freeQty,
//             qty,
//             purchasePrice,
//             discountType,
//             discount,
//             originalPrice,
//             mrp,
//             salePriceInclTax,
//             salePriceExclTax,
//             costPriceWithoutTax,
//             taxPercentage,
//             taxAmount,
//             packing,
//             pack,
//             totalAmount,
//             grandTotal
//         } = req.body

//         const userId = req.session.userDetail.id

//         // console.log(888888888,req.body)
//         // Create an order with customer details
//         const order = await Order.create({
//             stockType: stockType,
//             outletId: outletId,
//             referenceNumber: referenceNumber,
//             orderDate: orderDate,
//             customerName: name,
//             customerMobile: mobileNo,
//             customerEmail: email,
//             paymentStatus : paymentStatus,
//             paymentMode : paymentMode,
//             remarks: remarks,
//             totalAmount: grandTotal,
//             userId : userId
//         });

//         let products = []
//         // Loop through the items (assuming itemId is a unique identifier for each product)
//         for (let i = 0; i < itemId.length; i++) {

//             const product = {
//                 outletId: outletId,
//                 stockType: stockType,
//                 supplierCustomer: supplierCustomer,
//                 itemId: itemId[i],
//                 hsnCode: hsnCode[i],
//                 batchNo: batchNo[i],
//                 mfgDate: mfgDate[i],
//                 expDate: expDate[i],
//                 freeQty: freeQty[i],
//                 qty: qty[i],
//                 purchasePrice: purchasePrice[i],
//                 discountType: discountType[i],
//                 discount: discount[i],
//                 originalPrice: originalPrice[i],
//                 mrp: mrp[i],
//                 salePriceInclTax: salePriceInclTax[i],
//                 salePriceExclTax: salePriceExclTax[i],
//                 costPriceWithoutTax: costPriceWithoutTax[i],
//                 taxPercentage: taxPercentage[i],
//                 taxAmount: taxAmount[i],
//                 packing: packing[i],
//                 pack: pack[i],
//                 totalAmount: totalAmount[i]
//             };
//             products.push(product);

//         }
//         // console.log(11111111,products)
//         // Create order items for each product
//         const orderItems = products.map(product => ({
//             orderFk: order.orderId,
//             outletId: product.outletId,
//             itemId: product.itemId,
//             stockType: stockType,
//             supplierCustomer: product.supplierCustomer,
//             hsnCode: product.hsnCode,
//             batchNo: product.batchNo,
//             mfgDate: product.mfgDate,
//             expDate: product.expDate,
//             freeQty: product.freeQty,
//             qty: product.qty,
//             purchasePrice: product.purchasePrice,
//             discountType: product.discountType,
//             discount: product.discount,
//             originalPrice: product.originalPrice,
//             mrp: product.mrp,
//             salePriceInclTax: product.salePriceInclTax,
//             salePriceExclTax: product.salePriceExclTax,
//             costPriceWithoutTax: product.costPriceWithoutTax,
//             taxPercentage: product.taxPercentage,
//             taxAmount: product.taxAmount,
//             packingType: product.packing,
//             pack: product.pack,
//             totalAmount: product.totalAmount
//         }));
//         // console.log(22222222222,orderItems)

//         const stockIn = await ProductPrice.bulkCreate(orderItems)
//         // console.log(stockIn)
//         req.flash('message', 'Stock Added Successfully')
//         return res.redirect('/stockInList')

//     } catch (err) {
//         console.log(err)
//         req.flash('message', 'Something Went Wrong')
//         return res.redirect('/stockIn')
//     }

// }

//  create stock In Details
const addStockIn = async (req, res) => {
    const code = req.body.referenceNumber.split("/")
    const lastNo = code[1]

    // Update the lastno value in the database
    const updatedRefNum = await AutoGenerateNumber.update(
        { lastNo },
        { where: { prefix: code[0], suffix: code[2] } }
    );

    try {
        const {
            stockType,
            referenceNumber,
            purchaseOrderId,
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
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePriceInclTax,
            salePriceExclTax,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal
        } = req.body



        const userId = req.session.userDetail.id

        // console.log(888888888,req.body)
        // Create an order with customer details
        const order = await Order.create({
            stockType: stockType,
            purchaseOrderFk: purchaseOrderId,
            outletId: outletId,
            referenceNumber: referenceNumber,
            orderDate: orderDate,
            customerName: name,
            customerMobile: mobileNo,
            customerEmail: email,
            paymentStatus: paymentStatus,
            paymentMode: paymentMode,
            remarks: remarks,
            totalAmount: grandTotal,
            userId: userId,
            approve_b: "approved"
        });

        await PurchaseOrder.update({ approve_b: 'approved', purchaseInvoiceId: order.orderId, isInvoiceGenerated : '1' }, { where: { orderId: purchaseOrderId } })

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
                salePriceInclTax: salePriceInclTax[i],
                salePriceExclTax: salePriceExclTax[i],
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
            salePriceInclTax: product.salePriceInclTax,
            salePriceExclTax: product.salePriceExclTax,
            costPriceWithoutTax: product.costPriceWithoutTax,
            taxPercentage: product.taxPercentage,
            taxAmount: product.taxAmount,
            packingType: product.packing,
            pack: product.pack,
            totalAmount: product.totalAmount,
            approve_b: "approved"
        }));

        // Create stock ledger entries for each product
        const stockLedgerEntries = products.map(product => ({
            productPriceFk: order.orderId,
            itemId: product.itemId,
            outletId: product.outletId,
            type: stockType,
            purchasePrice: product.purchasePrice,
            salePriceExclTax: product.salePriceExclTax,
            salePriceInclTax: product.salePriceInclTax,
            qty: product.qty,
            remarks: order.remarks,
            batchNo: product.batchNo,
            expDate: product.expDate,
            productHsnCode: product.hsnCode,
            created_by: userId
        }));

        await ProductPrice.bulkCreate(orderItems)
        await StockInOut.bulkCreate(stockLedgerEntries)
        // console.log(stockIn)
        req.flash('message', 'Stock Added Successfully')
        return res.redirect('/stockInList')

    } catch (err) {
        console.log(err)
        req.flash('message', 'Something Went Wrong')
        return res.redirect('/stockIn')
    }

}

// create purchase cancel
const addPurchaseCancel = async (req, res) => {


    const referenceNumber = await Order.findOne({ where: { orderId: req.body.referenceNumber } })
    await Order.update({ isReturn: '1' }, { where: { orderId: req.body.referenceNumber }});

    try {
        const {
            stockType,
            purchaseOrderId,
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
            freeQty,
            qty,
            returnQty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePriceInclTax,
            salePriceExclTax,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal
        } = req.body

        const userId = req.session.userDetail.id

        // console.log(888888888,req.body)
        // Create an order with customer details
        const order = await Order.create({
            stockType: stockType,
            orderType: "PR",
            purchaseOrderFk: referenceNumber.purchaseOrderFk,
            isReturn : "1",
            outletId: outletId,
            referenceNumber: referenceNumber.referenceNumber,
            orderDate: orderDate,
            customerName: name,
            customerMobile: mobileNo,
            customerEmail: email,
            paymentStatus: paymentStatus,
            paymentMode: paymentMode,
            remarks: remarks,
            totalAmount: grandTotal,
            userId: userId,
            approve_b: "approved"
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
                returnQty : returnQty[i],
                purchasePrice: purchasePrice[i],
                discountType: discountType[i],
                discount: discount[i],
                originalPrice: originalPrice[i],
                mrp: mrp[i],
                salePriceInclTax: salePriceInclTax[i],
                salePriceExclTax: salePriceExclTax[i],
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
            returnQty: product.returnQty,
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
            totalAmount: product.totalAmount,
            approve_b: "approved"
        }));

        // Create stock ledger entries for each product
        const stockLedgerEntries = products.map(product => ({
            productPriceFk: order.orderId,
            itemId: product.itemId,
            outletId: product.outletId,
            type: stockType,
            purchasePrice: product.purchasePrice,
            salePriceExclTax: product.salePriceExclTax,
            salePriceInclTax: product.salePriceInclTax,
            qty: product.returnQty,
            remarks: order.remarks,
            batchNo: product.batchNo,
            expDate: product.expDate,
            productHsnCode: product.hsnCode,
            created_by: userId
        }));

        await ProductPrice.bulkCreate(orderItems)
        await StockInOut.bulkCreate(stockLedgerEntries)
        // console.log(stockIn)
        req.flash('message', 'Stock Added Successfully')
        return res.redirect('/purchaseInvoiceCancelList')

    } catch (err) {
        console.log(err)
        req.flash('message', 'Something Went Wrong')
        return res.redirect('/createPurchaseCancel')
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
            paymentStatus,
            paymentMode,
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
            salePriceInclTax,
            salePriceExclTax,
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
                salePriceInclTax: salePriceInclTax[i],
                salePriceExclTax: salePriceExclTax[i],
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

    const stockInOut = await Order.findAll({
        where: { ...whereClause, stockType: 'In', orderType: 'order' },
        include: [{
            model: Store
        }]
    });
    res.render('approval/stockInApprovalList', { title: 'Express', message: req.flash('message'), stockInOut });
}
const updateStockInApprovalStatus = async (req, res) => {
    const { action, selectedItemIds } = req.body;
    // let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of selectedItemIds) {
                await processApproval(orderId, action);
            }

            // if (flashMessages.length > 0) {
            //     req.flash('message', flashMessages.join(', '));
            // } else {
            //     req.flash('message', 'No approval requests were updated.');
            // }
            req.flash('message', 'All selected orders are successfully approved')
            return res.redirect('/stockInApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockInApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });
        const userId = req.session.userDetail.id

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
                    productPriceFk: stockInOut.orderFk,
                    itemId: stockInOut.itemId,
                    outletId: stockInOut.outletId,
                    type: stockInOut.stockType,
                    purchasePrice: stockInOut.purchasePrice,
                    salePriceInclTax: stockInOut.salePriceInclTax,
                    salePriceExclTax: stockInOut.salePriceExclTax,
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
            // }
            // flashMessages.push(`Checked Id ${orderId} ${action}`);
        }
    }
}

// new stock In approval list

const newStockInApprovalList = async function (req, res) {
    const role = req.session.userDetail.role
    if (role == 'admin' || role == 'super admin') {
        return res.render('approval/newStockInApprovalList', { title: 'Express', message: req.flash('message') });
    }
    req.flash('message', 'You can not access this page only super admin and your admin can do this')
    return res.redirect('/')
}

const updateNewStockInApprovalStatus = async (req, res) => {
    let draw = req.body.draw;
    let start = parseInt(req.body.start);
    let length = parseInt(req.body.length);
    let approvalStatus = req.body.approvalStatus;  // Retrieve outletId from the request
    const userId = req.session.userDetail.id
    const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
    let userStores = []
    userStores = userStoreMapping.map(mapping => mapping.storeFk)

    let where = {};

    if (req.body.search.value) {
        where[Op.or] = [
            { referenceNumber: { [Op.like]: `%${req.body.search.value}%` } },
            { '$store_master.storeName$': { [Op.like]: `%${req.body.search.value}%` } },
            { customerName: { [Op.like]: `%${req.body.search.value}%` } },
            { orderDate: { [Op.like]: `%${req.body.search.value}%` } },
            { totalAmount: { [Op.like]: `%${req.body.search.value}%` } },
        ];
    }

    const order = await Order.findAll({
        where: { ...where, orderType: 'order', stockType: 'In', approve_b: approvalStatus, outletId: userStores },
        limit: length,
        offset: start,
        include: [{
            model: Store
        }]
    });

    const count = await Order.count({ where: { orderType: 'order', stockType: 'In', approve_b: approvalStatus, outletId: userStores } })


    let arr = [];

    for (let i = 0; i < order.length; i++) {

        arr.push({
            'referenceNumber': order[i].referenceNumber,
            'storeName': order[i].store_master.storeName,
            'customerName': order[i].customerName,
            'orderDate': order[i].orderDate,
            'totalAmount': order[i].totalAmount,
            'status': order[i].approve_b,
            'orderId': order[i].orderId
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


const updateApprovalStatusOfStockIn = async (req, res) => {

    const { orders, action } = req.body;

    // let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of orders) {
                await processApproval(orderId, action);
            }
            req.flash('message', 'All selected orders are successfully approved')
            return res.redirect('/stockInApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockInApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });
        const userId = req.session.userDetail.id

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
            // }
            // flashMessages.push(`Checked Id ${orderId} ${action}`);
        }
    }
}

// Sale Quotation
const addSaleQuotation = async (req, res) => {
    //     const code=req.body.referenceNumber.split("/")
    //   const lastNo=code[1]

    // Update the lastno value in the database
    //    const updatedRefNum = await AutoGenerateNumber.update(
    //     { lastNo },
    //     { where: { prefix: code[0] }}
    //   );
    try {
        const {
            // stockType : "In",
            referenceNumber,
            orderDate,
            outletId,
            supplierCustomer,
            name,
            email,
            mobileNo,
            paymentStatus,
            paymentMode,
            remarks,
            description,
            itemId,
            hsnCode,
            batchNo,
            mfgDate,
            expDate,
            freeQty,
            qty,
            rate,
            discountType,
            discount,
            originalPrice,
            mrp,
            purchasePrice,
            salePriceExclTax,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal,
        } = req.body;



        // Create an order with customer details

        const order = await SaleQuotation.create({
            stockType: "In",
            outletId: outletId,
            referenceNumber: referenceNumber,
            orderDate: orderDate,
            customerName: name,
            customerMobile: mobileNo,
            paymentStatus: paymentStatus,
            paymentMode: paymentMode,
            customerEmail: email,
            remarks,
            totalAmount: grandTotal,
        });

        // return console.log(852,order)
        let products = [];
        // Loop through the items (assuming itemId is a unique identifier for each product)
        for (let i = 0; i < itemId.length; i++) {
            const product = {
                outletId: outletId,
                // stockType: stockType,
                // supplierCustomer: supplierCustomer,
                itemId: itemId[i],
                // hsnCode: hsnCode[i],
                // batchNo: batchNo[i],
                // mfgDate: mfgDate[i],
                // expDate: expDate[i],
                // freeQty: freeQty[i],
                qty: qty[i],
                purchasePrice: purchasePrice[i],
                // discountType: discountType[i],
                // discount: discount[i],
                // originalPrice: originalPrice[i],
                mrp: mrp[i],
                rate: rate[i],
                description: description[i],
                //  salePrice: salePrice[i],
                // costPriceWithoutTax: costPriceWithoutTax[i],
                // taxPercentage: taxPercentage[i],
                // taxAmount: taxAmount[i],
                // packing: packing[i],
                // pack: pack[i],
                totalAmount: totalAmount[i],
            };

            products.push(product);
        }

        // console.log(11111111,products)
        // Create order items for each product
        const orderItems = products.map((product) => ({
            orderFk: order.id,
            outletId: product.outletId,
            itemId: product.itemId,
            // stockType: stockType,
            // supplierCustomer: product.supplierCustomer,
            // hsnCode: product.hsnCode,
            // batchNo: product.batchNo,
            // mfgDate: product.mfgDate,
            // expDate: product.expDate,
            // freeQty: product.freeQty,
            qty: product.qty,
            purchasePrice: product.purchasePrice,
            // discountType: product.discountType,
            // discount: product.discount,
            // originalPrice: product.originalPrice,
            mrp: product.mrp,
            rate: product.rate,
            description: product.description,
            // salePrice: product.salePrice,
            // costPriceWithoutTax: product.costPriceWithoutTax,
            // taxPercentage: product.taxPercentage,
            // taxAmount: product.taxAmount,
            // packingType: product.packing,
            // pack: product.pack,
            totalAmount: product.totalAmount,
        }));
        // console.log(22222222222,orderItems)

        const stockIn = await SaleQuotationItem.bulkCreate(orderItems);
        // console.log(stockIn)
        req.flash("message", "Sale Quotaion Added Successfully");
        return res.redirect("/saleQuotationList");
    } catch (err) {
        console.log(err);
        req.flash("message", "Something Went Wrong");
        return res.redirect("/saleQuotationList");
    }
};


// update sale Quotation
const updateSaleQuotaion = async (req, res) => {

    try {
        // Existing product details
        const orderUpdate = await SaleQuotation.findOne({
            where: { rowguid: req.params.id },
        });

        const productPrice = await SaleQuotationItem.findAll({
            where: { orderFk: orderUpdate.id },
        });
        let pRowguid = [];
        pRowguid = productPrice.map((map) => map.rowguid);

        const {
            stockType,
            referenceNumber,
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
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePriceInclTax,
            rate,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            description,
            totalAmount,
            grandTotal,
        } = req.body;
        // add extra field
        req.body.pRowguid = pRowguid;
        // Create an order with customer details if needed
        const order = await SaleQuotation.update(
            {
                stockType: 'In',
                outletId: outletId,
                referenceNumber: referenceNumber,
                orderDate: orderDate,
                customerName: name,
                customerMobile: mobileNo,
                customerEmail: email,
                paymentStatus: paymentStatus,
                paymentMode: paymentMode,
                remarks: remarks,
                totalAmount: grandTotal,
                approve_b: "approved",
            },
            { where: { rowguid: req.params.id } }
        );

        // Create an array to track which products are updated and which are new
        const updatedProducts = [];
        const newProducts = [];

        // Loop through the items (assuming itemId is a unique identifier for each product)
        for (let i = 0; i < itemId.length; i++) {
            const product = {
                orderFk: productPrice.id,
                outletId: outletId,
                // stockType: stockType,
                supplierCustomer: supplierCustomer,
                itemId: itemId[i],
                // hsnCode: hsnCode[i],
                // batchNo: batchNo[i],
                // mfgDate: mfgDate[i],
                // expDate: expDate[i],
                // freeQty: freeQty[i],
                qty: qty[i],
                purchasePrice: purchasePrice[i],
                // discountType: discountType[i],
                // discount: discount[i],
                // originalPrice: originalPrice[i],
                mrp: mrp[i],
                rate: rate[i],
                // salePriceExclTax: salePriceExclTax[i],
                // costPriceWithoutTax: costPriceWithoutTax[i],
                // taxPercentage: taxPercentage[i],
                // taxAmount: taxAmount[i],
                // packing: packing[i],
                // pack: pack[i],
                description: description[i],
                totalAmount: totalAmount[i],
                rowguid: pRowguid[i] || generateRowguid(),
                approve_b: "pending",
            };

            // Check if the product already exists based on itemId and outletId
            const existingProduct = await SaleQuotationItem.findOne({
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
            const uuid = require("uuid");
            return uuid.v4();
        }

        // Here, you can handle updatedProducts and newProducts as needed

        req.flash("message", "Sale Quotation Updated Successfully");
        return res.redirect("/saleQuotationList");
    } catch (err) {
        console.log(err);
        req.flash("message", "Something Went Wrong");
        return res.redirect("/saleQuotationList");
    }
};



// Create Stock Out Details
const addStockOut = async (req, res) => {
    const code = req.body.referenceNumber.split("/")
    const lastNo = code[1]

    // Update the lastno value in the database
    const updatedRefNum = await AutoGenerateNumber.update(
        { lastNo },
        { where: { prefix: code[0] } }
    );
    try {

        const {
            stockType,
            referenceNumber,
            saleExecutive,
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
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePriceInclTax,
            salePriceExclTax,
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
            saleExecutive: saleExecutive,
            orderDate: orderDate,
            customerName: name,
            customerMobile: mobileNo,
            paymentStatus: paymentStatus,
            paymentMode: paymentMode,
            customerEmail: email,
            remarks: remarks,
            totalAmount: grandTotal,
            approve_b : "approved"
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
                salePriceInclTax: salePriceInclTax[i],
                salePriceExclTax: salePriceExclTax[i],
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
            salePriceInclTax: product.salePriceInclTax,
            salePriceExclTax: product.salePriceExclTax,
            costPriceWithoutTax: product.costPriceWithoutTax,
            taxPercentage: product.taxPercentage,
            taxAmount: product.taxAmount,
            packingType: product.packing,
            pack: product.pack,
            totalAmount: product.totalAmount
        }));

        const userId = req.session.userDetail.id

        // Create stock ledger entries for each product
        const stockLedgerEntries = products.map(product => ({
            productPriceFk: order.orderId,
            itemId: product.itemId,
            outletId: product.outletId,
            type: stockType,
            purchasePrice: product.purchasePrice,
            salePriceExclTax: product.salePriceExclTax,
            salePriceInclTax: product.salePriceInclTax,
            qty: product.qty,
            remarks: order.remarks,
            batchNo: product.batchNo,
            expDate: product.expDate,
            productHsnCode: product.hsnCode,
            created_by: userId
        }));

        await ProductPrice.bulkCreate(orderItems)
        await StockInOut.bulkCreate(stockLedgerEntries)
        // console.log(stockIn)
        req.flash('message', 'Stock Out Details Added Successfully')
        return res.redirect('/stockOutList')

    } catch (err) {
        console.log(err)
        req.flash('message', 'Something Went Wrong')
        return res.redirect('/stockOutList')
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
            saleExecutive,
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
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePriceInclTax,
            salePriceExclTax,
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
                saleExecutive: saleExecutive,
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
                salePriceInclTax: salePriceInclTax[i],
                salePriceExclTax: salePriceExclTax[i],
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

        req.flash('message', 'Stock Out Updated Successfully');
        return res.redirect('/stockOutList');
    } catch (err) {
        console.log(err);
        req.flash('message', 'Something Went Wrong');
        return res.redirect('/stockOut');
    }
};


const cancelSalesInvoice = async (req, res) => {
    try {
        // Find the order by rowguid
        const order = await Order.findOne({ where: { rowguid: req.params.id } });

        // Update the order's 'isDeleted' flag
        await order.update({ isDeleted: '1', deleteRemark : req.body.deleteRemark });

        // Fetch product prices associated with the order
        const productPrices = await ProductPrice.findAll({ where: { orderFk: order.orderId } });

        // Transform product prices into an array of products
        const products = productPrices.map(productPrice => ({
            orderFk:order.orderId,
            outletId: order.outletId,
            stockType: "In",
            supplierCustomer: productPrice.supplierCustomer,
            itemId: productPrice.itemId,
            hsnCode: productPrice.hsnCode,
            batchNo: productPrice.batchNo,
            mfgDate: productPrice.mfgDate,
            expDate: productPrice.expDate,
            freeQty: productPrice.freeQty,
            qty: productPrice.qty,
            purchasePrice: productPrice.purchasePrice,
            discountType: productPrice.discountType,
            discount: productPrice.discount,
            originalPrice: productPrice.originalPrice,
            mrp: productPrice.mrp,
            salePriceInclTax: productPrice.salePriceInclTax,
            salePriceExclTax: productPrice.salePriceExclTax,
            costPriceWithoutTax: productPrice.costPriceWithoutTax,
            taxPercentage: productPrice.taxPercentage,
            taxAmount: productPrice.taxAmount,
            packing: productPrice.packing,
            pack: productPrice.pack,
            totalAmount: productPrice.totalAmount
        }));

        // Create order items for each product
        const orderItems = products.map(product => ({
            orderFk:order.orderId,
            outletId: order.outletId,
            itemId: product.itemId,
            stockType: 'In',
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

        const userId = req.session.userDetail.id;

        // Create stock ledger entries for each product
        const stockLedgerEntries = products.map(product => ({
            productPriceFk: order.orderId,
            itemId: product.itemId,
            outletId: product.outletId,
            type: product.stockType,
            purchasePrice: product.purchasePrice,
            salePriceExclTax: product.salePriceExclTax,
            salePriceInclTax: product.salePriceInclTax,
            qty: product.qty,
            remarks: order.remarks,
            batchNo: product.batchNo,
            expDate: product.expDate,
            productHsnCode: product.hsnCode,
            created_by: userId
        }));

        // Bulk create order items and stock ledger entries
        await ProductPrice.bulkCreate(orderItems);
        await StockInOut.bulkCreate(stockLedgerEntries);

        req.flash('message', 'Stock Out Details Added Successfully');
        return res.redirect('/stockOutList');
    } catch (err) {
        console.error(err);
        req.flash('message', 'Something Went Wrong');
        return res.redirect('/stockOutList');
    }
};



//Create sale Return
const saleReturnEntry = async (req, res) => {
    // return console.log(req.body)
    const code=req.body.referenceNumber.split("/")
    const lastNo=code[1]

    // Update the lastno value in the database
     const updatedRefNum = await AutoGenerateNumber.update(
      { lastNo },
      { where: { prefix: code[0], suffix : code[2] }}
    );
    try {
        const {
            stockType,
            referenceNumber,
            salesInvoiceNo,
            saleExecutive,
            orderDate,
            outletId,
            supplierCustomer,
            name,
            email,
            mobileNo,
            paymentStatus,
            paymentMode,
            remarks,
            deleteRemark,
            itemId,
            hsnCode,
            batchNo,
            mfgDate,
            expDate,
            freeQty,
            qty,
            returnQty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePriceInclTax,
            salePriceExclTax,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal
        } = req.body;

        const orderInvoiceNo = await Order.findOne({where : {orderId : salesInvoiceNo}})

        // Create an order with customer details
        const order = await Order.create({
            stockType: stockType,
            saleExecutive : saleExecutive,
            orderType: "SR",
            outletId: outletId,
            referenceNumber: referenceNumber,
            salesInvoiceNo:orderInvoiceNo.referenceNumber,
            orderDate: orderDate,
            customerName: name,
            customerMobile: mobileNo,
            customerEmail: email,
            remarks: remarks,
            deleteRemark: deleteRemark,
            totalAmount: grandTotal,
            approve_b : "approved"
        });

        let products = [];
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
                returnQty: returnQty[i],
                purchasePrice: purchasePrice[i],
                discountType: discountType[i],
                discount: discount[i],
                originalPrice: originalPrice[i],
                mrp: mrp[i],
                salePriceExclTax: salePriceExclTax[i],
                salePriceInclTax: salePriceInclTax[i],
                costPriceWithoutTax: costPriceWithoutTax[i],
                taxPercentage: taxPercentage[i],
                taxAmount: taxAmount[i],
                packing: packing[i],
                pack: pack[i],
                totalAmount: totalAmount[i],
            };
            products.push(product);
        }
        // console.log(11111111,products)
        // Create order items for each product
        const orderItems = products.map((product) => ({
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
            returnQty: product.returnQty,
            purchasePrice: product.purchasePrice,
            discountType: product.discountType,
            discount: product.discount,
            originalPrice: product.originalPrice,
            mrp: product.mrp,
            salePriceExclTax: product.salePriceExclTax,
            salePriceInclTax: product.salePriceInclTax,
            costPriceWithoutTax: product.costPriceWithoutTax,
            taxPercentage: product.taxPercentage,
            taxAmount: product.taxAmount,
            packingType: product.packing,
            pack: product.pack,
            totalAmount: product.totalAmount,
        }));
        // console.log(22222222222,orderItems)
        const userId = req.session.userDetail.id

        // Create stock ledger entries for each product
        const stockLedgerEntries = products.map((product) => ({
            productPriceFk: order.orderId,
            itemId: product.itemId,
            outletId: product.outletId,
            type: stockType,
            purchasePrice: product.purchasePrice,
            salePriceExclTax: product.salePriceExclTax,
            salePriceInclTax: product.salePriceInclTax,
            qty: product.returnQty,
            remarks: order.remarks,
            batchNo: product.batchNo,
            expDate: product.expDate,
            productHsnCode: product.hsnCode,
            created_by: userId,
        }));
        const stockIn = await ProductPrice.bulkCreate(orderItems);
        await StockInOut.bulkCreate(stockLedgerEntries);
        req.flash("message", "Sale Return Successfully");
        return res.redirect("/saleReturnList");
    } catch (err) {
        console.log(err);
        req.flash("message", "Something Went Wrong");
        return res.redirect("/saleReturnList");
    }
};

// update sale retune
const updateSaleQuotation = async (req, res) => {

    try {
        // Existing product details
        const orderUpdate = await Order.findOne({
            where: { rowguid: req.params.id },
        });

        const productPrice = await ProductPrice.findAll({
            where: { orderFk: orderUpdate.orderId },
        });
        let pRowguid = [];
        pRowguid = productPrice.map((map) => map.rowguid);
        const {
            stockType,
            referenceNumber,
            orderDate,
            outletId,
            remarks,
            itemId,
            hsnCode,
            batchNo,
            saleExecutive,
            mfgDate,
            expDate,
            freeQty,
            qty,
            purchasePrice,
            discountType,
            discount,
            originalPrice,
            mrp,
            salePriceExclTax,
            salePriceInclTax,
            costPriceWithoutTax,
            taxPercentage,
            taxAmount,
            packing,
            pack,
            totalAmount,
            grandTotal,
        } = req.body;
        // add extra field
        req.body.pRowguid = pRowguid;
        // Create an order with customer details if needed
        const order = await Order.update(
            {
                stockType: stockType,
                outletId: outletId,
                referenceNumber: referenceNumber,
                saleExecutive,
                orderDate: orderDate,
                // customerName: "-1",
                customerMobile: "-1",
                customerEmail: "-1",
                remarks: remarks,
                totalAmount: grandTotal,
                approve_b: "pending",
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
                supplierCustomer: "-1",
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
                salePriceExclTax: salePriceExclTax[i],
                salePriceInclTax: salePriceInclTax[i],
                costPriceWithoutTax: costPriceWithoutTax[i],
                taxPercentage: taxPercentage[i],
                taxAmount: taxAmount[i],
                packing: packing[i],
                pack: pack[i],
                totalAmount: totalAmount[i],
                rowguid: pRowguid[i] || generateRowguid(),
                approve_b: "pending",
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
            const uuid = require("uuid");
            return uuid.v4();
        }

        // Here, you can handle updatedProducts and newProducts as needed

        req.flash("message", "Sales Return Updated Successfully");
        return res.redirect("/saleReturnList");
    } catch (err) {
        console.log(err);
        req.flash("message", "Something Went Wrong");
        return res.redirect("/saleReturnList");
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

    const stockInOut = await Order.findAll({
        where: { ...whereClause, stockType: 'Out', orderType: 'order' },
        include: [{
            model: Store
        }]
    });
    res.render('approval/stockOutApprovalList', { title: 'Express', message: req.flash('message'), stockInOut });
}
const updateStockOutApprovalStatus = async (req, res) => {
    const { action, selectedItemIds } = req.body;
    // let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of selectedItemIds) {
                await processApproval(orderId, action);
            }

            // if (flashMessages.length > 0) {
            //     req.flash('message', flashMessages.join(', '));
            // } else {
            //     req.flash('message', 'No approval requests were updated.');
            // }
            req.flash('message', 'All selected orders are successfully approved')
            return res.redirect('/stockOutApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockOutApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });
        const userId = req.session.userDetail.id
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
                    productPriceFk: stockInOut.orderFk,
                    itemId: stockInOut.itemId,
                    outletId: stockInOut.outletId,
                    type: stockInOut.stockType,
                    purchasePrice: stockInOut.purchasePrice,
                    salePriceInclTax: stockInOut.salePriceInclTax,
                    salePriceExclTax: stockInOut.salePriceExclTax,
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
            // }

            // flashMessages.push(`Checked Id ${orderId} ${action}`);   
        }
    }
}

// new stock In approval list

const newStockOutApprovalList = async function (req, res) {

    const role = req.session.userDetail.role
    console.log(role)
    if (role == 'admin' || role == 'super admin') {
        return res.render('approval/newStockOutApprovalList', { title: 'Express', message: req.flash('message') });
    }
    req.flash('message', 'You can not access this page only super admin and your admin can do this')
    return res.redirect('/')
}

const updateNewStockOutApprovalStatus = async (req, res) => {
    console.log(123)
    let draw = req.body.draw;
    let start = parseInt(req.body.start);
    let length = parseInt(req.body.length);
    let approvalStatus = req.body.approvalStatus;  // Retrieve outletId from the request
    const userId = req.session.userDetail.id
    const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
    let userStores = []
    userStores = userStoreMapping.map(mapping => mapping.storeFk)

    let where = {};

    if (req.body.search.value) {
        where[Op.or] = [
            { referenceNumber: { [Op.like]: `%${req.body.search.value}%` } },
            { '$store_master.storeName$': { [Op.like]: `%${req.body.search.value}%` } },
            { customerName: { [Op.like]: `%${req.body.search.value}%` } },
            { orderDate: { [Op.like]: `%${req.body.search.value}%` } },
            { totalAmount: { [Op.like]: `%${req.body.search.value}%` } },
        ];
    }


    const order = await Order.findAll({
        where: { ...where, orderType: 'order', stockType: 'Out', approve_b: approvalStatus, outletId: userStores },
        limit: length,
        offset: start,
        include: [{
            model: Store
        }]
    });

    const count = await Order.count({ where: { orderType: 'order', stockType: 'Out', approve_b: approvalStatus, outletId: userStores } })

    let arr = [];

    for (let i = 0; i < order.length; i++) {

        arr.push({
            'referenceNumber': order[i].referenceNumber,
            'storeName': order[i].store_master.storeName,
            'customerName': order[i].customerName,
            'orderDate': order[i].orderDate,
            'totalAmount': order[i].totalAmount,
            'status': order[i].approve_b,
            'orderId': order[i].orderId
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


const updateApprovalStatusOfStockOut = async (req, res) => {

    const { orders, action } = req.body;

    // let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of orders) {
                await processApproval(orderId, action);
            }
            req.flash('message', 'All selected orders are successfully approved')
            return res.redirect('/stockInApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockInApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });
        const userId = req.session.userDetail.id

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
            // }
            // flashMessages.push(`Checked Id ${orderId} ${action}`);
        }
    }
}



// Opening Stock Entry Module
const openingStockEntryIn = async (req, res) => {
    const code = req.body.referenceNumber.split("/")
    const lastNo = code[1]

    // Update the lastno value in the database
    const updatedRefNum = await AutoGenerateNumber.update(
        { lastNo },
        { where: { prefix: code[0] } }
    );
    try {

        const {
            stockType,
            referenceNumber,
            orderDate,
            outletId,
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
            salePriceExclTax,
            salePriceInclTax,
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
            orderType: 'openingStock',
            outletId: outletId,
            referenceNumber: referenceNumber,
            orderDate: orderDate,
            customerName: '-1',
            customerMobile: '-1',
            customerEmail: '-1',
            remarks: remarks,
            totalAmount: grandTotal
        });

        let products = []
        // Loop through the items (assuming itemId is a unique identifier for each product)
        for (let i = 0; i < itemId.length; i++) {

            const product = {
                outletId: outletId,
                stockType: stockType,
                supplierCustomer: '-1',
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
                salePriceExclTax: salePriceExclTax[i],
                salePriceInclTax: salePriceInclTax[i],
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
            salePriceExclTax: product.salePriceExclTax,
            salePriceInclTax: product.salePriceInclTax,
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
        return res.redirect('/openingStockList')

    } catch (err) {
        console.log(err)
        req.flash('message', 'Something Went Wrong')
        return res.redirect('/openingStockEntryIn')
    }
}

// Update Opening Stock Entry Module
const updateOpeningStockEntryIn = async (req, res) => {
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
            salePriceExclTax,
            salePriceInclTax,
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
                orderType: 'openingStock',
                outletId: outletId,
                referenceNumber: referenceNumber,
                orderDate: orderDate,
                customerName: '-1',
                customerMobile: '-1',
                customerEmail: '-1',
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
                supplierCustomer: "-1",
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
                salePriceExclTax: salePriceExclTax[i],
                salePriceInclTax: salePriceInclTax[i],
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

        req.flash('message', 'Stock Updated Successfully');
        return res.redirect('/openingStockList');
    } catch (err) {
        console.log(err);
        req.flash('message', 'Something Went Wrong');
        return res.redirect('/openingStockList');
    }
};

// Opening Stock Entry Approval Module
const openingStockEntryApprovalList = async function (req, res) {

    const approvalStatus = req.query.approvalStatus; // Get the approval status from query parameter

    let whereClause = {};

    if (approvalStatus === 'pending') {
        whereClause = { approve_b: 'pending' };
    } else if (approvalStatus === 'approved') {
        whereClause = { approve_b: "approved" };
    } else if (approvalStatus === 'rejected') {
        whereClause = { approve_b: "rejected" };
    }

    const stockInOut = await Order.findAll({
        where: { ...whereClause, orderType: 'openingStock' },
        include: [{
            model: Store
        }]
    });
    res.render('approval/openingStockEntryApprovalList', { title: 'Express', message: req.flash('message'), stockInOut });
}
const updateOpeningStockEntryApprovalStatus = async (req, res) => {
    const { action, selectedItemIds } = req.body;
    // let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of selectedItemIds) {
                await processApproval(orderId, action);
            }

            // if (flashMessages.length > 0) {
            //     req.flash('message', flashMessages.join(', '));
            // } else {
            //     req.flash('message', 'No approval requests were updated.');
            // }
            req.flash('message', 'All selected orders are successfully approved')
            return res.redirect('/stockInApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockInApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });
        const userId = req.session.userDetail.id

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
            // }
            // flashMessages.push(`Checked Id ${orderId} ${action}`);
        }
    }
}

// new opening stock approval list

const newOpeningStockApprovalList = async function (req, res) {

    const role = req.session.userDetail.role
    if (role == 'admin' || role == 'super admin') {
        return res.render('approval/newOpeningStockApprovalList', { title: 'Express', message: req.flash('message') });
    }
    req.flash('message', 'You can not access this page only super admin and your admin can do this')
    return res.redirect('/')
}

const updateNewOpeningStockApprovalStatus = async (req, res) => {
    console.log(123)
    let draw = req.body.draw;
    let start = parseInt(req.body.start);
    let length = parseInt(req.body.length);
    let approvalStatus = req.body.approvalStatus;  // Retrieve outletId from the request
    const userId = req.session.userDetail.id
    const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
    let userStores = []
    userStores = userStoreMapping.map(mapping => mapping.storeFk)

    let where = {};

    if (req.body.search.value) {
        where[Op.or] = [
            { referenceNumber: { [Op.like]: `%${req.body.search.value}%` } },
            { '$store_master.storeName$': { [Op.like]: `%${req.body.search.value}%` } },
            { customerName: { [Op.like]: `%${req.body.search.value}%` } },
            { orderDate: { [Op.like]: `%${req.body.search.value}%` } },
            { totalAmount: { [Op.like]: `%${req.body.search.value}%` } },
        ];
    }


    const order = await Order.findAll({
        where: { ...where, orderType: 'openingStock', approve_b: approvalStatus, outletId: userStores },
        limit: length,
        offset: start,
        include: [{
            model: Store
        }]
    });

    const count = await Order.count({ where: { orderType: 'openingStock', approve_b: approvalStatus, outletId: userStores } })

    let arr = [];

    for (let i = 0; i < order.length; i++) {

        arr.push({
            'referenceNumber': order[i].referenceNumber,
            'storeName': order[i].store_master.storeName,
            'orderDate': order[i].orderDate,
            'totalAmount': order[i].totalAmount,
            'status': order[i].approve_b,
            'orderId': order[i].orderId
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


const updateApprovalStatusOfOpeningStock = async (req, res) => {

    const { orders, action } = req.body;

    // let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of orders) {
                await processApproval(orderId, action);
            }
            req.flash('message', 'All selected orders are successfully approved')
            return res.redirect('/stockInApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockInApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });
        const userId = req.session.userDetail.id

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
            // }
            // flashMessages.push(`Checked Id ${orderId} ${action}`);
        }
    }
}






//Create Product Damage Details
const productDamageEntryOut = async (req, res) => {
    const code = req.body.referenceNumber.split("/")
    const lastNo = code[1]

    // Update the lastno value in the database
    const updatedRefNum = await AutoGenerateNumber.update(
        { lastNo },
        { where: { prefix: code[0] } }
    );
    try {

        const {
            stockType,
            referenceNumber,
            orderDate,
            outletId,
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
            salePriceExclTax,
            salePriceInclTax,
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
            orderType: 'damage',
            outletId: outletId,
            referenceNumber: referenceNumber,
            orderDate: orderDate,
            customerName: '-1',
            customerMobile: '-1',
            customerEmail: '-1',
            remarks: remarks,
            totalAmount: grandTotal
        });

        let products = []
        // Loop through the items (assuming itemId is a unique identifier for each product)
        for (let i = 0; i < itemId.length; i++) {

            const product = {
                outletId: outletId,
                stockType: stockType,
                supplierCustomer: '-1',
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
                salePriceExclTax: salePriceExclTax[i],
                salePriceInclTax: salePriceInclTax[i],
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
            salePriceExclTax: product.salePriceExclTax,
            salePriceInclTax: product.salePriceInclTax,
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
        return res.redirect('/productDamageList')

    } catch (err) {
        console.log(err)
        req.flash('message', 'Something Went Wrong')
        return res.redirect('/productDamageList')
    }

}

// update product damage module
const updateproductDamageEntry = async (req, res) => {

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
            salePriceExclTax,
            salePriceInclTax,
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
                customerName: '-1',
                customerMobile: '-1',
                customerEmail: '-1',
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
                supplierCustomer: '-1',
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
                salePriceExclTax: salePriceExclTax[i],
                salePriceInclTax: salePriceInclTax[i],
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

        req.flash('message', 'Stock Out Updated Successfully');
        return res.redirect('/productDamageList');
    } catch (err) {
        console.log(err);
        req.flash('message', 'Something Went Wrong');
        return res.redirect('/productDamageList');
    }
};

// product damage Approval Module
const productDamageEntryApprovalList = async function (req, res) {

    const approvalStatus = req.query.approvalStatus; // Get the approval status from query parameter

    let whereClause = {};

    if (approvalStatus === 'pending') {
        whereClause = { approve_b: 'pending' };
    } else if (approvalStatus === 'approved') {
        whereClause = { approve_b: "approved" };
    } else if (approvalStatus === 'rejected') {
        whereClause = { approve_b: "rejected" };
    }

    const stockInOut = await Order.findAll({
        where: { ...whereClause, stockType: 'Out', orderType: 'damage' },
        include: [{
            model: Store
        }]
    });
    res.render('approval/productDamageEntryApprovalList', { title: 'Express', message: req.flash('message'), stockInOut });
}
const updateProductDamageEntryApprovalStatus = async (req, res) => {
    const { action, selectedItemIds } = req.body;
    // let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of selectedItemIds) {
                await processApproval(orderId, action);
            }

            // if (flashMessages.length > 0) {
            //     req.flash('message', flashMessages.join(', '));
            // } else {
            //     req.flash('message', 'No approval requests were updated.');
            // }
            req.flash('message', 'All selected orders are successfully approved')
            return res.redirect('/stockOutApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockOutApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });
        const userId = req.session.userDetail.id
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
            // }

            // flashMessages.push(`Checked Id ${orderId} ${action}`);   
        }
    }
}

// new opening stock approval list

const newProductDamageApprovalList = async function (req, res) {
    const role = req.session.userDetail.role
    if (role == 'admin' || role == 'super admin') {
        return res.render('approval/newProductDamageApprovalList', { title: 'Express', message: req.flash('message') });
    }
    req.flash('message', 'You can not access this page only super admin and your admin can do this')
    return res.redirect('/')
}

const updateNewProductDamageApprovalStatus = async (req, res) => {
    console.log(123)
    let draw = req.body.draw;
    let start = parseInt(req.body.start);
    let length = parseInt(req.body.length);
    let approvalStatus = req.body.approvalStatus;  // Retrieve outletId from the request
    const userId = req.session.userDetail.id
    const userStoreMapping = await UserStoreMapping.findAll({ where: { userFk: userId } })
    let userStores = []
    userStores = userStoreMapping.map(mapping => mapping.storeFk)

    let where = {};

    if (req.body.search.value) {
        where[Op.or] = [
            { referenceNumber: { [Op.like]: `%${req.body.search.value}%` } },
            { '$store_master.storeName$': { [Op.like]: `%${req.body.search.value}%` } },
            { customerName: { [Op.like]: `%${req.body.search.value}%` } },
            { orderDate: { [Op.like]: `%${req.body.search.value}%` } },
            { totalAmount: { [Op.like]: `%${req.body.search.value}%` } },
        ];
    }


    const order = await Order.findAll({
        where: { ...where, orderType: 'damage', approve_b: approvalStatus, outletId: userStores },
        limit: length,
        offset: start,
        include: [{
            model: Store
        }]
    });

    const count = await Order.count({ where: { orderType: 'damage', approve_b: approvalStatus, outletId: userStores } })

    let arr = [];

    for (let i = 0; i < order.length; i++) {

        arr.push({
            'referenceNumber': order[i].referenceNumber,
            'storeName': order[i].store_master.storeName,
            'orderDate': order[i].orderDate,
            'totalAmount': order[i].totalAmount,
            'status': order[i].approve_b,
            'orderId': order[i].orderId
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

const updateApprovalStatusOfProductDamage = async (req, res) => {

    const { orders, action } = req.body;

    // let flashMessages = [];

    if (action === 'approved' || action === 'rejected') {
        try {
            for (const orderId of orders) {
                await processApproval(orderId, action);
            }
            req.flash('message', 'All selected orders are successfully approved')
            return res.redirect('/stockInApprovalList');
        } catch (err) {
            console.log(err);
            req.flash('message', 'Something went wrong');
            return res.redirect('/stockInApprovalList');
        }
    }

    async function processApproval(orderId, action) {
        const order = await Order.findOne({ where: { orderId: orderId } });
        const userId = req.session.userDetail.id

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
            // }
            // flashMessages.push(`Checked Id ${orderId} ${action}`);
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
    createPurchaseOrder,
    updatePurchaseOrder,
    addStockIn,
    addPurchaseCancel,
    updateStockIn,
    stockInApprovalList,
    updateStockInApprovalStatus,
    newStockInApprovalList,
    updateNewStockInApprovalStatus,
    updateApprovalStatusOfStockIn,
    addSaleQuotation,
    updateSaleQuotaion,
    addStockOut,
    updateStockOut,
    cancelSalesInvoice,
    saleReturnEntry,
    updateSaleQuotation,
    stockOutApprovalList,
    newStockOutApprovalList,
    updateNewStockOutApprovalStatus,
    updateApprovalStatusOfStockOut,
    openingStockEntryIn,
    openingStockEntryApprovalList,
    updateOpeningStockEntryApprovalStatus,
    updateOpeningStockEntryIn,
    newOpeningStockApprovalList,
    updateNewOpeningStockApprovalStatus,
    updateApprovalStatusOfOpeningStock,
    productDamageEntryOut,
    updateproductDamageEntry,
    productDamageEntryApprovalList,
    updateProductDamageEntryApprovalStatus,
    newProductDamageApprovalList,
    updateNewProductDamageApprovalStatus,
    updateApprovalStatusOfProductDamage,
    updateStockOutApprovalStatus,
    stockInOut,
    stockInOutApprovalList,
    updateStockInOutApprovalStatus,
}