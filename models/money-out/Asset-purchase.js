const mongoose = require('mongoose');

const assetPurchaseSchema = new mongoose.Schema({
    asset_title: {
        type: String,
        required: true
    },
    life_of_asset: {
        type: Number,
        required: true
    },
    rate: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        require: true
    },
    installment: Boolean,
    deposit_amount: Number,
    payment_frequency: String,
    no_of_times: Number,
    selected_dates: [{
        type: String
    }],
    supplier: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }],
    payment_method: String,
    date: String,
    time: String
})

module.exports = mongoose.model('asset_purchase', assetPurchaseSchema)