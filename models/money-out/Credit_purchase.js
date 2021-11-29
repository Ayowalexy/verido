const mongoose = require('mongoose')


const creditPurchaseSchema = new mongoose.Schema({
    labourID:{
        type: String,
        required: true
    },
    discount: Boolean,
    total_price: Number,
    payment_frequency: String,
    no_of_times: Number,
    selected_dates: [{
        type: String
    }],
    reduction: Number,
    discount_percent: Number,
    deposit_amount: Number,
    description: {
        type: String,
        required: true
    },
    customer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    payment_method: String,
    sale_date: String,
    sale_time: String
})

module.exports = mongoose.model('Money_out_credit_purchase', creditPurchaseSchema)