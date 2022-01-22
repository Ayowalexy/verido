const mongoose = require('mongoose')


const refundSchema = new mongoose.Schema({
    productID: {
        type: String,
        required: true
    },
    supplier: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }],
    refund_amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    payment_method: String,
    sale_date: String,
    sale_time: String
})


module.exports = mongoose.model('Refund', refundSchema)