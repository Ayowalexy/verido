const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
    material: {
        type: String,
        required: true
    },
    unit_price: {
        type: Number,
        required: true
    },
    unit_type: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Material', materialSchema)