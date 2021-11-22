const ConnectRoles = require('connect-roles')

const userRoles = new ConnectRoles({
    failureHandler(req, res, action){
        if(action === 'access password reset'){
            res.redirect('/reset-password')
        }

        res.json({"code": 403, "status": "Unauthorised", "message": "Access to password reset is unverified"})

    }
})

userRoles.use('access password reset', (req) => {
    return true
})

module.exports = userRoles