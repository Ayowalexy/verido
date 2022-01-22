const mongoose = require('mongoose')


const otherTransactionSchema = new mongoose.Schema({
    itemID: {
        type: String,
        required: true
    },
    amount_due: Number,
    amount_paid: Number,
    pament_frequency: String,
    no_of_times: Number,
    selected_dates: [{
        type: String
    }],
    description: {
        type: String,
        required: true
    },
    supplier: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }],
    payment_method: String,
    date: String,
    time: String
})

module.exports = mongoose.model('money_out_other', otherTransactionSchema)