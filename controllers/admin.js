if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const Admin = require('../models/admin/Admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/users/Users')
const catchAsync = require('../utils/catchAsync')
const nodemailer = require('nodemailer')
const Consultant = require('../models/admin/Consultant')
// const schedule = requrie('node-schedule')
const SubScription = require('../models/users/Subcription.js')
<<<<<<< HEAD
const Message = require('../models/admin/Messages')
=======
>>>>>>> a0cb98cd3135644bce6036258963c2c75f87355d

// const rule = new schedule.RecurrenceRule();
// rule.minute = 30;

// const job = schedule.scheduleJob(rule, async function(){

//   const date_1 = new Date()
//   const subs = await Subscription.find()
//   subs.map(data => {
//     let d_1 = new Date(data.expires)

//   })
//   console.log('The answer to life, the universe, and everthing!');
// });



module.exports.register_admin = async (req, res) => {
    await bcrypt.hash(req.body.password, 12).then(async function(hash){
        const newAdmin = new Admin({username: req.body.email, password: hash})
        await newAdmin.save();
        res.status(200).json({"code": 200, "message": "Admin Registered"})
    })
}

module.exports.admin_login = catchAsync(async(req, res, next) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({username: email})
        const consultant = await Consultant.findOne({email: email})
        if(admin){
            bcrypt.compare(password, admin.password).then(function(result){
              console.log('admin')
                console.log(result)
                if(result){
                    jwt.sign({username: admin.username}, 'secretkey', async function(err, token){
                        admin.token = token;
                        await admin.save();
                        return res.status(200).json({"code": 200, "message": "Ok", "response": admin, "role": "admin"})
                    })
                } 
                else {
                    return res.status(401).json({"code": 401, "message": "Unauthorised"})
                }


            })
        } else if(consultant){
          console.log(password, 'consultant')
          bcrypt.compare(password, consultant.password).then(function(result){
            console.log(result)
            if(result){
                jwt.sign({email: consultant.email}, 'secretkey', async function(err, token){
                    consultant.token = token;
                    await consultant.save();
                    return res.status(200).json({"code": 200, "message": "Ok", "response": consultant, "role": "consultant"})
                })
            } 
            else {
                return res.status(401).json({"code": 401, "message": "Unauthorised"})
            }


        })
        }
         else {
          return res.status(401).json({"code": 401, "message": "Unauthorised"})
        }  

    } catch (e){
        return next(e)
    }
})


module.exports.resetPassword = async (req, res, next) => {
  const { email } = req.body;
      const user = await Admin.findOne({username: email})
      console.log(user)
      if(user){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: `${process.env.FROM}`,
              pass: `${process.env.PASSWORD}`,
            },
          })


        const token = jwt.sign({email}, 'secretkey', {expiresIn: '15m'})
        const link = `https://verido-admin.herokuapp.com/reset-password/${token}`
  
        const mailOptions = {
          from:   `${process.env.FROM}`, 
          to: `${req.body.email}`, 
          message: 'Reset Password',
          subject: 'Confirm Password Update', 
          text: link
        }
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log(error)
            res.json({
              status: 'fail'
            })
          } else {
            res.status(200).json(info)
              console.log(info)
            res.json({
             status: 'success'
            })
          }
        })
        
      }

     
    
}

module.exports.passwordUpdate = catchAsync(async (req, res, next) => {
  try {

    const { email, confirm_password } = req.body;
    const user = await Admin.findOne({username: email})
    if(user){
      await bcrypt.hash(confirm_password, 12).then(async function(hash){
        await Admin.findOneAndUpdate({username: email}, { password: hash})
        return res.status(200).json({"code": 200, "status": "Ok", "message": "Password Successfully updates"})
      })
    }
  } catch(e){
    next(e)
  }
})

module.exports.business = catchAsync(async( req, res, next) => {
  // try {
  //     jwt.verify(req.token, 'secretkey', async function (err, data){
  //       if(err){
        //   console.log('Failed Auth')
        //   res.status(403).json({"code": 403, "message": 'Auth failed'})
        // } else {
          const users = await User.find().populate('business')
          .populate('subscription_status')
          .populate('userID')
          .populate('insitution')

          res.status(200).json({"code": 200, "response": users})
  //       }
  //     })
  // } catch(e) {
  //   next(e)
  // }
})

module.exports.admins = catchAsync( async (req, res, next) => {
  try {
    const Admins = await Admin.find();
    return res.status(200).json({"admins": Admins})
  } catch(e){
    return next(e)
  }
})

module.exports.admin_new_message = catchAsync( async (req, res, next) => {
  try {
    const { admin } = req.params;
    const message = new Message({...req.body})
    await message.save();

    const current_admin = await Admin.findOne({_id: admin})
    current_admin.messages.push(message);

    await current_admin.save();

    return res.status(200).json({messege: 'Ok'})
  } catch (e){
    return next(e)
  }
})

module.exports.fetch_admin_message = catchAsync( async ( req, res, next) => {
  try {
    const { admin } = req.params;

    const current_admin = await Admin.findOne({_id: admin}).populate('messages')
    if(current_admin){
      return res.status(200).json({messges: current_admin})
    }
  } catch (e){
    return next(e)
  }
})