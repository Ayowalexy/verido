const mongoose = require('mongoose')

const businessSchema = new mongoose.Schema({
    name : String,
    sector : String,
    type : String,
    currency : String,
    currencySymbol : String
})

module.exports = mongoose.model('business', businessSchema)