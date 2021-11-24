const mongoose = require('mongoose')

const newProductSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    cost_price: {
        type: Number,
        require: true
    }, 
    margin: {
        type: String
    },
    selling_price: {
        type: String,
        required: true
    },
    forcast: {
        type: Number
    },
    rate: {
        type: String
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale'
    },
    image: String,
    material: String,
    labour: String
})

module.exports = mongoose.model('Product', newProductSchema)