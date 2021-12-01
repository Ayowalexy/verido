
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')


const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: [true, 'Full name cannot be blank']
    },
    token: String,
    photoUrl: String,
    dateJoined : {
        type: String,
    },
    phoneVerified : Boolean,
    idVerified : {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        unique: true,
        index: true
    },
    database: String,
    username: {
        type: String,
        required: [true, 'Phone number is required']
    },
    loginToken: {
        type: String
    },
    organization_id: {
        type: String,
        unique: true,
        index: true
    },
    subscription_status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subscription'
    },
    business : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'business'
    },
    customer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    suppliers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }],
    money_in : {
        other_transaction: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Other Transaction'
        }],
        refund: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Refund'
        }],
        material_assign: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Material'
        }],
        labour_assign: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Labour'
        }],
    },
    money_out: {
         direct_material_purchase: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'money_out_direct_materials'
         }],
        //  credit_purchase: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'money_out_credit_purchase'
        //  }],
         direct_labour: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'money_out_direct_labour'
         }],
        //  materials: [{
        //      type: mongoose.Schema.Types.ObjectId,
        //      ref: 'money_out_material'
        //  }],
         overhead: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'overhead'
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
             ref: 'asset_purchase'
         }]
    }

})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Users', userSchema)