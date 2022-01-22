const mongoose = require('mongoose')

const consultantSchema = new mongoose.Schema({
    username: String,
    password: String,
    token: String,
    email: String,
    mobile_number: String,
    business: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Messages'
    }]
})
// console.log()

module.exports = mongoose.model('consultants', consultantSchema)