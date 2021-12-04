const express = require('express')
const router = express.Router();
const password = require('../controllers/password')
const verifyToken = require('../authenticate')

router.post('/reset-password', password.resetPassword)

router.post('/verify-password-reset-token', verifyToken, password.verifyPasswordResetToken)

router.post('/upadate-password', verifyToken, password.updatePassword)

module.exports = router