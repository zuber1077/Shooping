const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    slug: { type: String },
    content: {
        type: String,
        require: true
    },
    desc: {
        type: String,
        require: true
    },
    category: {
        type: String,
        required: true
    },
    price: { 
        type: Number,
        require: true
    },
    image: { type: String }
});

const Products = module.exports = mongoose.model('Products', ProductSchema);