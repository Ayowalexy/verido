const mongoose = require('mongoose')


const refundGivenSchema = new mongoose.Schema({
    transactionID: {
        type: String,
        required: true
    },
    customer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    redund_amount: Number,
    description: {
        type: String,
        required: true
    },
    payment_method: String,
    sale_date: String,
    sale_time: String
})

module.exports = mongoose.model('money_out_refund_given', refundGivenSchema)