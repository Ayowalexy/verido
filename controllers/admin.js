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
const Business = require('../models/users/Business')
const Message = require('../models/admin/Messages')
const {TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN} = process.env
const twilio = require('twilio')(TWILO_ACCOUNT_SID, TWILO_AUTH_TOKEN);
const nodemaile = require('nodemailer')
const Videos = require('../models/users/Videos')

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
// console.log()


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

        console.log('user', admin, consultant)
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
          .populate('consultant')

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

module.exports.suspendUser = catchAsync( async (req, res, next) => {
  try{
        const { id } = req.params;
        const user = await User.findById({_id: id})
        if(user){
          
        
            if(req.params.type == 'suspend-user'){
              await User.findByIdAndUpdate({_id: id, }, 
                {password: user.password.concat('suspended'), suspended: true})

              twilio.messages
                .create({
                  body: `Your account is suspended`,
                  from: '+447401123846',
                  to: user.username
                })
                .then(message => console.log(message.sid))
                .catch(e => console.log(e))
            } else {
              await User.findByIdAndUpdate({_id: id, }, 
                {password: user.password.slice(0, user.password.indexOf('suspended')), suspended: false})
              twilio.messages
              .create({
                body: `Your account is Re-activated`,
                from: '+447401123846',
                to: user.username
              })
              .then(message => console.log(message.sid))
              .catch(e => console.log(e))
            }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "codewithbiyi@gmail.com", 
      pass: "08032243047", 
    },
  });

  const mailOptions = {
    from: 'codewithbiyi@gmail.com',
    to: 'seinde4@yahoo.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!',
    html: "<b>Hello world?</b>", // html body
  };
 
//   transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });



        // const transporter = nodemailer.createTransport({
        //   service: 'gmail',
        //   auth: {
        //     user: `${process.env.FROM}`,
        //     pass: `${process.env.PASSWORD}`,
        //   },
        // })

        // const mailOptions = {
        //   from:   `${process.env.FROM}`, 
        //   to: `${user.email}`, 
        //   message: 'Account Suspended',
        //   subject: 'Den don suspend your account alaye', 
        //   text: "Follow admin reason make he help ypu open am ASAP"
        // }

        // transporter.sendMail(mailOptions, (error, info) => {
        //   if (error) {
        //       console.log(error)
        //     res.json({
        //       status: 'fail'
        //     })
        //   } else {
        //     res.status(200).json(info)
        //       console.log(info)
        //     res.json({
        //      status: 'success'
        //     })
        //   }
        // })
        

        res.status(200).json({"message": "Ok"})
        }
        
       

  } catch(e){
    return next(e)
  }
})


module.exports.updateUserInformation = catchAsync( async (req, res, next) => {
  try {
    const {phoneVerified} = req.body;
    const user = await User.findByIdAndUpdate({
      _id: req.params.id
    }, {
      phoneVerified: phoneVerified
    })

    res.json({"message": "Ok"})
  } catch (e){
    return next(e)
  }
})


module.exports.updateBusiness = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('business')
console.log(req.body)
    
    await Business.findByIdAndUpdate({_id: user.business._id.toString()}, {...req.body})

    const user_1 = await User.findById(req.params.id).populate('business')

    console.log('user found', user_1.business)
    res.send("helo")
  } catch(e){
    return next(e)
  }
})

module.exports.editVideos =  catchAsync(async (req, res, next) => {
  try {
    const vid = await Videos.findById(req.params.id)
    console.log(vid)
    
    await Videos.findByIdAndUpdate({_id: req.params.id}, {...req.body})

    res.status(200).json({"status": "succcess"})
  } catch (e){
    return next(e)
  }
})


module.exports.updateSubscription = catchAsync(async (req, res, next) => {
  try {
      await SubScription.findByIdAndUpdate({_id: req.params.id}, {...req.body})
      res.status(200).json({messge: "Ok"})
      

  } catch (e){
    return next(e)
  }
})


module.exports.updateUsername = catchAsync(async (req, res, next) => {
  try {
    await User.findOneAndUpdate({_id: req.params.id}, {...req.body})
    res.status(200).json({message: "Ok"})
  } catch(e){
    return next(e)
  }
})