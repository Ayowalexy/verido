if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const User = require('../models/users/Users')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const {TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN} = process.env
const twilio = require('twilio')(TWILO_ACCOUNT_SID, TWILO_AUTH_TOKEN);
const bcrypt = require('bcrypt')


module.exports.resetPassword = catchAsync(async(req, res, next) => {
    try {
        jwt.sign({user: req.body.phoneNumber}, 'secretkey', async (err, token) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: req.body.phoneNumber})
                console.log(user)
                if(user == null){
                    return res.status(403).json({"code": 403, "status": "Authorised", "message": `User with ${req.body.phoneNumber} is not registered`})
                }
    
                twilio.verify.services(process.env.VERIFICATION_SID)
                .verifications
                .create({to: req.body.phoneNumber, channel: 'sms'})
                .then(verification => res.status(200).json({"code": 200, "verification token": token, "status": "Ok", "message": `${verification.status}`}))
                .catch(e => {
                    next(e)
                    res.status(500).send(e);
                });
            }
        })
    } catch(e){ 
        return next(e)
    }
})

module.exports.verifyPasswordResetToken = catchAsync(async(req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const { otp } = req.body; 
                console.log(data)
                const check = await twilio.verify.services(process.env.VERIFICATION_SID)
                    .verificationChecks
                    .create({to: data.user, code: otp})
                    .then(verification => res.status(200).json({"code": 200, "status": "Ok", "message": `${verification.status}`}))
            }
        })
    } catch(e){
        return next(e)
    }
})

module.exports.updatePassword = catchAsync(async(req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                    await bcrypt.hash(req.body.password, 12).then( async function(hash){
                        await User.findOneAndUpdate({username: data.user}, {password: hash})
                    })
                    res.json({"code": 200, "status": "Ok", "message": "Password successfully updated"})
               
            }
        })
    } catch(e){
        return next(e)
    }
})