const express = require('express')
const router = express.Router()
const Auth = require('../controllers/auth')
const passport = require('passport')

router.post('/register', Auth.register)

router.get('/login', Auth.getLogin)

router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), Auth.login)

router.post('/send-verificatio', Auth.sendVerification)

router.post('/verify-otp', Auth.verifyOTP)

module.exports = router