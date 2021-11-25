const mongoose = require('mongoose')

const labourSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    labout_type: {
        type: String,
        required: true
    },
    rate: {
        type: String,
        required: true
    },
    unit_price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Labour', labourSchema)