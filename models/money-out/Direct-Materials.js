const mongoose = require('mongoose')

const directMaterialSchema = new mongoose.Schema({
    materialID: {
        type: String,
        required: true
    },
    discount: Boolean,
    reduction: Number,
    discount_percent: Number,
    payment_frequency: String,
    no_of_times: String,
    day_select: String,
    amount_due: Number,
    amount_paid: Number,
    description: {
        type: String,
        required: true
    },
    supplierId:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }],
    payment_method: String,
    date: String,
    time: String
})

module.exports = mongoose.model('Money_out_direct_materials', directMaterialSchema)