const db = require("../models")
const Store = db.store;


const createStore = async (req, res) => {

    try {

        let info = {
            outletId,
            storeName,
            storeAddress
        } = req.body

        const store = await Store.create(info)
        req.flash('message', 'Store added sucessfully');
        return res.redirect('/storeList')

    }

    catch (err) {
        res.status(500).send({
            success: false,
            message: "something went wrong"
        })
        console.log(err)
    }

}

// Get All Store Details
const getAllStoreDetails = async (req, res) => {
    const stores = await Store.findAll()
    res.status(200).send({
        success: true,
        stores
    })
}


// Update Store Details

const updateStore = async (req, res) => {
   
   try{
console.log(123)
    const store = await Store.update(req.body, { where: { outletId: req.params.id } })

    if (!store) {
        res.status(200).send({
            success: false,
            message: "Store Not Found"
        })
    }

    req.flash('message', 'Store Details updated sucessfully');
    return res.redirect('/storeList')

   }catch (err) {
    console.log(err.message)
    res.status(500).send({
        success: false,
        message: "something went wrong"
    })
}
    
    
}


module.exports = {
    createStore,
    getAllStoreDetails,
    updateStore
}