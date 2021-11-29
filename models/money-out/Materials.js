const mongoose = require('mongoose')


const materialSchema = new mongoose.Schema({
    materialImage: String,
    materialName: {
        type: String,
        required: true
    },
    select_unit: {
        type: String,
        required: true
    },
    unit_price: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Money_out_material', materialSchema)