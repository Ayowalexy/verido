const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    message: String,
    from: String,
    to: String
})

// console.log()
module.exports = mongoose.model('Messages', messageSchema)