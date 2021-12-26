
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Credit = require('../money-out/Credit_purchase')
const Institution = require('./Institution')
const Video = require('./Videos')
const UserID = require('./UserID')


const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    stripeCustomerID: String,
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
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: UserID
    },
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Video

    }],
    insitution: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Institution,
    }],
    database: String,
    username: {
        type: String,
        required: [true, 'Phone number is required']
    },
    password: {
        type: String,
        required: true
    },
    loginToken: {
        type: String
    },
    organization_id: {
        type: String
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
         credit_purchase: [{
            type: mongoose.Schema.Types.ObjectId,
            // ref: 'money_out_credit_purchase'
            ref: Credit
         }],
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