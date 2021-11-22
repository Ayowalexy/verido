// const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose');


// const userSchema = new mongoose.Schema({
//     full_name: {
//         type: String,
//         required: [true, 'Full name cannot be blank']
//     },
//     username: String,
//     phone_number: {
//         type: Number,
//         required: [true, 'Phone number is required']
//     },
//     organization_id: String,
//     password: String
// })

// userSchema.plugin(passportLocalMongoose)

// module.exports = mongoose.model('Users', userSchema)
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')


const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: [true, 'Full name cannot be blank']
    },
    email: String,
    username: {
        type: Number,
        required: [true, 'Phone number is required']
    },
    organization_id: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Users', userSchema)