const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    vidoeID : {
        type: String,
        default: 'SnEIJaPl008'
    },
    category : {
            type: String,
            default: 'Tutorial Video'
    }
})

module.exports = mongoose.model('videos', videoSchema)