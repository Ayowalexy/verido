const mongoose = require('mongoose')

const institutionSchema = new mongoose.Schema({
    name : {
        type: String,
        default: 'null'
    },
    email : {
            type: Boolean,
            default: true,
            default: 'null'
    },
    institutionShouldAccessData : {
        type: Boolean,
        default: true
    },
    institutionShouldExportData : {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('institution', institutionSchema)