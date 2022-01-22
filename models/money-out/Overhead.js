const mongoose = require('mongoose')

const overheadSchema = new mongoose.Schema({
    overheadID: {
        type: String,
        required: true
    },
    discount: Boolean,
    amount_due: Number,
    amount_paid: Number,
    reduction: Number,
    discount_percent: Number,
    payment_frequency: String,
    no_of_times: Number,
    selected_day: String,
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

module.exports = mongoose.model('overhead', overheadSchema)