const mongoose = require('mongoose')

const userIDSchema = new mongoose.Schema({
    NIN : {
        type: Number,
    },
    BVN : {
            type: Number,
    }
})

module.exports = mongoose.model('userID', userIDSchema)