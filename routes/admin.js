const express = require('express')
const router = express.Router();
const verifyToken = require('../authenticate')
const Admin = require('../controllers/admin')

router.post('/admin-register', Admin.register_admin)

router.post('/admin-login', Admin.admin_login)

router.post('/admin-reset-password', Admin.resetPassword)

router.post('/admin-password-update', Admin.passwordUpdate)

router.get('/admin-business',  Admin.business)

router.get('/fetch-admins', Admin.admins)

router.post('/new-admin-message/:admin', Admin.admin_new_message)

router.post('/update-user-information/:id', Admin.updateUserInformation)

router.get('/fetch-admin-message/:admin', Admin.fetch_admin_message)

router.get('/suspend-user/:id/:type', Admin.suspendUser)

router.post('/update-business/:id', Admin.updateBusiness)

module.exports = router