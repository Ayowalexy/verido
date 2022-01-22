const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    customer_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    email_address: String,
    business_name: String,
    address_line_1: String,
    address_line_2: String,
    town_city: String,
    region: String,
    post_code: Number
})


module.exports = mongoose.model('Customer', customerSchema)