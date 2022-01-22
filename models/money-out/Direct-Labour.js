const mongoose = require('mongoose')

const directLabourSchema = new mongoose.Schema({
    labourID: String,
    discount: Boolean,
    amount_paid: Number,
    reduction: Number,
    discount_percent: Number,
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
    payment_frequency: String,
    no_of_times: Number,
    day_selected: String,
    time: String
})

module.exports = mongoose.model('money_out_direct_labour', directLabourSchema)