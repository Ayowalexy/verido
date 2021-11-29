const mongoose = require('mongoose')


const overheadSchema = new mongoose.Schema({
    select_category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    rate: {
        type: StereoPannerNode,
        required: true
    },
    remind_me: Boolean,
    selected_reminder_name: String
})

module.exports = mongoose.model('new_overhead', overheadSchema)