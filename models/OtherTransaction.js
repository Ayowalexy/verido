const mongoose = require('mongoose')

const otherTransactionSchema = new mongoose.Schema({
    productID: {
        type: String,
        required: true
    },
    discount: Boolean,
    amount_due: {
        type: Number,
        required: true
    },
    amount_paid: {
        type: Number,
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
    payment_method: String,
    date: String,
    time: String
})

module.exports = mongoose.model('Other Transaction', otherTransactionSchema)