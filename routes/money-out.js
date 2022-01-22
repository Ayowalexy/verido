const express = require('express')
const router = express.Router()
const MoneyOut = require('../controllers/money-out.js')

router.post('/direct-material-purchase', MoneyOut.directMaterialPurchase)

router.post('/direct-labour-purchase', MoneyOut.directLabourPurchase)

router.post('/overhead', MoneyOut.overhead)

router.post('/asset-purchase', MoneyOut.assetPurchase)

router.post('/credit-purchase', MoneyOut.creditPurchase)

router.post('/other-transaction', MoneyOut.otherTransaction)

module.exports = router