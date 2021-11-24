const mongoose = require('mongoose')
const newProduct = require('./Product')

const saleSchema = new mongoose.Schema({
    discount: {
        type: Boolean,
        required: true
    },
    amount_due: {
        type: Number,
        required: true
    },
    amount_paid: {
        type: Number,
        required: true
    },
    payment_frequency: String,
    no_of_times: Number,
    selected_day: String,
    description: {
        type: String,
        required: true
    },
    payment_method: String,
    sale_date: String,
    sale_time: String
})

module.exports = mongoose.model('Sale', saleSchema)