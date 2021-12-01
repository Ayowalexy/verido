const express = require('express')
const router = express.Router()
const Auth = require('../controllers/auth')
const passport = require('passport')
const multer = require('multer')
const {storage} = require('../cloudinary/index')
const upload = multer({ storage })
const dbUpload = multer({dest: 'uploads/'})

router.post('/register', upload.single('image'), Auth.register)

router.get('/login', Auth.getLogin)

router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), Auth.login)

router.post('/send-verification/:salt', Auth.sendVerification)

router.post('/verify-otp/:salt', Auth.verifyOTP)

router.post('/db-lite', dbUpload.single('db'), Auth.veridoDB)

module.exports = router