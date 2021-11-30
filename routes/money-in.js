const express = require('express')
const router = express.Router();
const MoneyIn = require('../controllers/money-in')

router.post('/add-product', MoneyIn.addProduct);

router.post('/add-material', MoneyIn.addMaterial)

router.post('/add-labour', MoneyIn.addLabour)

router.post('/refund-received', MoneyIn.refundReceived)

router.post('/credit-sale', MoneyIn.creditSale)

router.post('/other-transaction', MoneyIn.otherTransaction)

module.exports = router