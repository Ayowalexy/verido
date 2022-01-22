const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    message: String,
    from: String,
    to: String
})


module.exports = mongoose.model('Messages', messageSchema)