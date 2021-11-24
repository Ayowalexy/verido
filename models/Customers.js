const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    customer: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Customer', customerSchema)