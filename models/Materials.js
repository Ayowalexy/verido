const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
    material: String,
    unit_price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Material', materialSchema)