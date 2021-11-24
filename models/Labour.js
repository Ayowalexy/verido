const mongoose = require('mongoose')

const labourSchema = new mongoose.Schema({
    labour: String,
    unit_price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Labour', labourSchema)