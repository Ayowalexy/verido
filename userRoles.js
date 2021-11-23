const ConnectRoles = require('connect-roles')

const userRoles = new ConnectRoles({
    failureHandler(req, res, action){
        if(action === 'access password reset'){
            res.redirect('/reset-password')
        }

        res.status(403).json({"code": 403, "status": "Unauthorised", "message": "Access to password reset is unverified"})

    }
})

userRoles.use('access password reset', (req) => {
    if(req.user.role === 'access password reset'){
        return true
    }
    return false
})

module.exports = userRoles