const User  = require('../models/users/Users')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const {TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN} = process.env
const twilio = require('twilio')(TWILO_ACCOUNT_SID, TWILO_AUTH_TOKEN);

module.exports.register = catchAsync(async(req, res, next) => {

    try {
        const { full_name, email, username, password, organization_id } = req.body;

        console.log(req.body)
        const emailUser = await User.findOne({email})

        if(emailUser){
            return res.status(401).json({"code": 401, "status": "Duplicate", "message": `${emailUser.email} is already registered`})
        }

        const user = new User({full_name, username, email, organization_id})
        const newUser = await User.register(user, password)
        req.login(newUser, e => {
            if(e) return next(e)
            res.json({"code": 200, "status": "success", "message": `Successfully registered ${user.full_name}`})
            //res.redirect('/login')
        })
    } catch(e){
        return next(e)
       // res.redirect('/register')
    }
       
})


module.exports.getLogin =  (req, res) => {
    res.json({"code": 401, "status": "Unauthorized", "message": "Phone number or password is incorrect"})
}

module.exports.login =  async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({username})
    req.session.currentUser = req.body;
    if(user){
        return res.json({"code": 200, "status": "success", "message": `Welcome ${user.full_name}`})
    }

}


let phoneNumber;
let foundUser;


module.exports.sendVerification = catchAsync(async (req, res) => {
        

       try {
           usersMap.push({phoneNumber: phoneNumber})
            phoneNumber = req.body.phoneNumber;

            const user = await User.findOne({username: phoneNumber})
            if(!user){
                return res.status(403).json({"code": 403, "status": "Authorised", "message": `User with ${phoneNumber} is not registered`})
            }

            foundUser = user

            twilio.verify.services(process.env.VERIFICATION_SID)
            .verifications
            .create({to: phoneNumber, channel: 'sms'})
            .then(verification => res.status(200).json({"code": 200, "status": "Ok", "message": `${verification.status}`}))
            .catch(e => {
                next(e)
                res.status(500).send(e);
            });
       } catch (e){
           next(e)
       }
});

module.exports.verifyOTP =  catchAsync(async (req, res) => {

    try {
        const { otp } = req.body; 
         for(let user of usersMap){
            if(user.phoneNumber === phoneNumber){
                user.otp = otp
            }
        }

        const check = await twilio.verify.services(process.env.VERIFICATION_SID)
            .verificationChecks
            .create({to: phoneNumber, code: otp})
            .then(verification => res.status(200).json({"code": 200, "status": "Ok", "message": `${verification.status}`}))
            .catch(e => {
                next(e)
                res.status(500).send(e);
            });
        
        res.status(200).send(check);
    } catch (e){
        next(e)
    }
});
