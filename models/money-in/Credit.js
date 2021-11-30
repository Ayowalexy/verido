const mongoose = require('mongoose')

const creditSaleSchema = new mongoose.Schema({
    productID: {
        type: String,
        required: true
    },
    discount: Boolean,
    total_price: {
        type: Number,
        required: true
    },
    select_days: [{
        type: String
    }],
    deposit_amount: {
        type: Number,
        required: true
    },
    payment_frequency: {
        type: String,
        required: true
    },
    no_of_times: {
        type: Number,
        required: true
    },
    select_day: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    customer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    payment_method: {
        type: String,
        required: true
    },
    sale_date: String,
    sale_time: String
})


module.exports = mongoose.model('Credit', creditSaleSchema)