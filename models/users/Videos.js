const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    vidoeID : {
        type: String,
<<<<<<< HEAD
    },
    category : {
            type: String,
=======
        default: 'SnEIJaPl008'
    },
    category : {
            type: String,
            default: 'Tutorial Video'
>>>>>>> a0cb98cd3135644bce6036258963c2c75f87355d
    },
    title: String
})

module.exports = mongoose.model('videos', videoSchema)