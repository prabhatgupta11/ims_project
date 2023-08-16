const db = require("../models")
const Category = db.category;


const addCategory = async (req, res) => {

    try {

        let info = {
            categoryId,
            shortDescription,
            longDescription
        } = req.body

        const category = await Category.create(info)
    
        console.log(category)
        req.flash('message', 'Category added sucessfully');
        return res.redirect('/categoryList')

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

const updateCategory = async (req, res) => {
   
    try{
 
     const category = await Category.update(req.body, { where: { categoryId: req.params.id } })
 
     if (!category) {
         res.status(200).send({
             success: false,
             message: "Category Not Found"
         })
     }
 
     req.flash('message', 'Category Details updated sucessfully');
     return res.redirect('/categoryList')
 
    }catch (err) {
     console.log(err.message)
     res.status(500).send({
         success: false,
         message: "something went wrong"
     })
 }
     
     
 }


module.exports = {
    addCategory,
    updateCategory
}