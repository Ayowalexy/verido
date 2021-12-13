const express = require('express')
const router = express.Router();
const verifyToken = require('../authenticate')
const Admin = require('../controllers/admin')

router.post('/admin-register', Admin.register_admin)

router.post('/admin-login', Admin.admin_login)

router.post('/admin-reset-password', Admin.resetPassword)

router.post('/admin-password-update', Admin.passwordUpdate)

module.exports = router