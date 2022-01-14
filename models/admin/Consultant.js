const mongoose = require('mongoose')

const consultantSchema = new mongoose.Schema({
    username: String,
    password: String,
    token: String,
    email: String,
    mobile_number: String
})

module.exports = mongoose.model('consultants', consultantSchema)