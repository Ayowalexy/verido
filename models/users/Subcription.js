const mongoose = require('mongoose')

const subscriptionStatus = new mongoose.Schema({
    type : {
        type: String,
    },
    status : {
            type: Boolean,
            default: true
    },
    started : {
        type: String,
    },
    expires : {
        type: String,
    }
})

module.exports = mongoose.model('subscription', subscriptionStatus)