const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    vidoeID : {
        type: String,
    },
    category : {
            type: String,
    },
    title: String
})

module.exports = mongoose.model('videos', videoSchema)