const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({

    productname: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
    },
    imagepath: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Products', ProductSchema);