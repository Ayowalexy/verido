const User  = require('../models/users/Users')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const {TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN} = process.env
const twilio = require('twilio')(TWILO_ACCOUNT_SID, TWILO_AUTH_TOKEN);
const bcrypt = require('bcrypt')
const Subscription = require('../models/users/Subcription')
const userMap = []


module.exports.register = catchAsync(async(req, res, next) => {

    try {
       
        const { path } = req.file || ''
        let token;
        bcrypt.hash(1234, 12, function(err, hash) {
            token = hash;
        })
        const { full_name, email, username, password, organization_id } = req.body;

        console.log(req.body)
        const emailUser = await User.findOne({email})

        if(emailUser){
            return res.status(401).json({"code": 401, "status": "Duplicate", "message": `${emailUser.email} is already registered`})
        }

        const dateJoined = new Date();
        let date = new Date()
        date.setDate(date.getDate() + 7)


        const newSubcription = new Subscription({
            type: 'trial',
            status: true,
            started: dateJoined.toDateString(),
            expires: date.toDateString()
        })

        await newSubcription.save()
        const user = new User({full_name, username, email, phoneVerified: true, photoUrl: path, dateJoined: dateJoined.toDateString(), organization_id, token})
        user.subscription_status = newSubcription
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


module.exports.dbLite = catchAsync( async (req, res, next) => {
    try {
        console.log(req.file)
    } catch(e){
        next(e)
    }
})
module.exports.login =  async (req, res, next) => {
    try {

        
        const { username } = req.body;
    const user = await User.findOne({username})
    req.session.currentUser = req.body;
    if(user){
       // const { username } = req.session.currentUser;
        // const { id } = req.user;       
        const user = await User.findOne({username}).populate({
            path: 'product',
            populate: {
                path: 'sale'
            }
        }).populate({
            path: 'product',
            populate: {
                path: 'credit_sale'
            }
        })
        .populate('customer')
        .populate('suppliers')
        .populate({
            path: 'money_in',
            populate: {
                path: 'other_transaction',
                populate: {
                    path: 'customer'
                }
            }
        })
        .populate({
            path: 'money_in',
            populate: {
                path: 'refund',
                populate: {
                    path: 'supplier'
                }
            }
        })
        .populate({
            path: 'money_in',
            populate: {
                path: 'material_assign',
            }
        })
        .populate({
            path: 'money_in',
            populate: {
                path: 'labour_assign',
            }
        })
        .populate({
            path: 'money_out',
            populate: {
                path: 'direct_material_purchase',
                populate: {
                    path: 'supplier'
                }
            }
        })
        .populate({
            path: 'money_out',
            populate: {
                path: 'credit_purchase',
                populate: {
                    path: 'customer'
                }
            }
        })
        .populate({
            path: 'money_out',
            populate: {
                path: 'refund_given',
                populate: {
                    path: 'customer'
                }
            }
        })
        .populate({
            path: 'money_out',
            populate: {
                path: 'direct_labour',
                populate: {
                    path: 'supplier'
                }
            }
        })
        .populate({
            path: 'money_out',
            populate: {
                path: 'asset_purchase',
                populate: {
                    path: 'supplier'
                }
            }
        })
        .populate({
            path: 'money_out',
            populate: {
                path: 'overhead',
                populate: {
                    path: 'supplier'
                }
            }
        })
        .populate({
            path: 'money_out',
            populate: {
                path: 'other_transaction',
                populate: {
                    path: 'supplier'
                }
            }
        })
        .populate({
            path: 'money_out',
            populate: {
                path: 'materials',
            }
        }).populate('token')
        .populate('business')
        .populate('subscription_status')
       
        return res.status(200).json({"code": 200, "status": "Ok", "message": "Money in transactions for product sale, refund, and other transactions", "response": user})
    }
    
       // return res.json({"code": 200, "status": "success", "message": `Welcome ${user.full_name}`})
    } catch (e){
        return next(e)
    }

}


let phoneNumber = [];
let foundUser;


module.exports.sendVerification = catchAsync(async (req, res, next) => {
        

       try {
            const { salt } = req.params;


            phoneNumber.push({phone: req.body.phoneNumber, salt: salt});

            const user = await User.findOne({username: phoneNumber})
            //userMap.push({username: phoneNumber, salt: num})
            if(!user){
                return res.status(403).json({"code": 403, "status": "Authorised", "message": `User with ${phoneNumber} is not registered`})
            }

            foundUser = user

            
            twilio.verify.services(process.env.VERIFICATION_SID)
            .verifications
            .create({to: req.body.phoneNumber, channel: 'sms'})
            .then(verification => res.status(200).json({"code": 200, "status": "Ok", "message": `${verification.status}`}))
            .catch(e => {
                next(e)
                res.status(500).send(e);
            });
       } catch (e){
           next(e)
       }
});

module.exports.verifyOTP =  catchAsync(async (req, res, next) => {

    try {
        const { otp } = req.body; 
        const { salt } = req.params
         
        let number = phoneNumber.find(data => {
            if(data.salt ===  salt){
                return data.phone
            }
        })
        console.log(phoneNumber, '======')
        console.log(number,'===')
        const check = await twilio.verify.services(process.env.VERIFICATION_SID)
            .verificationChecks
            .create({to: number.phone, code: otp})
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
