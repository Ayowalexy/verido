
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
    subscription_status: String,
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
    }],
    money_out: {
         direct_material_purchase: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Money_out_direct_materials'
         }],
         credit_purchase: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Money_out_credit_purchase'
         }],
         direct_labour: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Money_out_direct_labour'
         }],
         materials: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Money_out_material'
         }],
         overhead: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Overhead'
         }],
         other_transaction: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'money_out_other_transaction'
         }],
         refund_given: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'money_out_refund_given'
         }],
         asset_purchase: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Asset_purchase'
         }]
    }

})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Users', userSchema)