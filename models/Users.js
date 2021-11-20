const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: [true, 'Full name cannot be blank']
    },
    username: String,
    phone_number: {
        type: Number,
        required: [true, 'Phone number is required']
    },
    organization_id: String,
    password: String
})


module.exports = mongoose.model('Users', userSchema)