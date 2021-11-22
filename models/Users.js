
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
    }
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Users', userSchema)