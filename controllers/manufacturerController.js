const db = require("../models")
const Manufacturer = db.manufacturer;


const addManufacturer = async (req, res) => {

    try {

        let info = {
            manufacturerId,
            shortDescription,
            longDescription
        } = req.body

        const manufacturer = await Manufacturer.create(info)

        req.flash('message', 'Manufacturer added sucessfully');
        return res.redirect('/manufacturerList')

    }

    catch (err) {
        res.status(500).send({
            success: false,
            message: "something went wrong"
        })
        console.log(err)
    }

}


// Update Manufacturer Details

const updateManufacturer = async (req, res) => {
   
    try{
 
     const manufacturer = await Manufacturer.update(req.body, { where: { manufacturerId: req.params.id } })
 
     if (!manufacturer) {
         res.status(200).send({
             success: false,
             message: "Manufacturer Not Found"
         })
     }
 
     req.flash('message', 'Manufacturer Details updated sucessfully');
     return res.redirect('/manufacturerList')
 
    }catch (err) {
     console.log(err.message)
     res.status(500).send({
         success: false,
         message: "something went wrong"
     })
 }
     
     
 }



module.exports = {
    addManufacturer,
    updateManufacturer
}