const express = require('express')
const router = express.Router()
const Auth = require('../controllers/auth')
const passport = require('passport')
const multer = require('multer')
const {storage} = require('../cloudinary/index')
const upload = multer({ storage })

router.post('/register', upload.single('image'), Auth.register)

router.get('/login', Auth.getLogin)

router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), Auth.login)

router.post('/send-verification', Auth.sendVerification)

router.post('/verify-otp', Auth.verifyOTP)

module.exports = router