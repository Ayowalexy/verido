const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    token: String
})

module.exports = mongoose.model('Adim', adminSchema)