const mongoose = require('mongoose')



const ProductSchema = mongoose.Schema({
        product_code : {type : String, required : true},
        price : {type: String},
})

module.exports = mongoose.model('Product_list', ProductSchema)