
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')


const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: [true, 'Full name cannot be blank']
    },
    email: {
        type: String,
        unique: true,
        index: true
    },
    username: {
        type: Number,
        required: [true, 'Phone number is required']
    },
    organization_id: {
        type: String,
        unique: true,
        index: true
    },
    customer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    material_assign: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
    }],
    labour_assign: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Labour'
    }],
    refund: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Refund'
    }],
    other_transaction: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Other Transaction'
    }],
    suppliers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }]

})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Users', userSchema)