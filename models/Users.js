const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    username: String,
    phone_number: {
        type: Number,
        required: true
    },
    organization_id: Number,
    password: String
})


module.exports = mongoose.model('Users', userSchema)