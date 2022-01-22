const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    token: String,
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Messages'
    }]
})

module.exports = mongoose.model('Adim', adminSchema)