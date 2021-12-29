const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    vidoeID : {
        type: String,
        default: 'SnEIJaPl008'
    },
    category : {
            type: String,
            default: 'Tutorial Video'
    },
    title: String
})

module.exports = mongoose.model('videos', videoSchema)