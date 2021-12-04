const User  = require('../models/users/Users')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const {TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN} = process.env
const twilio = require('twilio')(TWILO_ACCOUNT_SID, TWILO_AUTH_TOKEN);
const bcrypt = require('bcrypt')
const Subscription = require('../models/users/Subcription')
const Business = require('../models/users/Business')
const userMap = []
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const jwt = require('jsonwebtoken')
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const { google } = require('googleapis')
const path = require('path')
const fs = require('fs');


const oauthclient = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
)

oauthclient.setCredentials({refresh_token: REFRESH_TOKEN})

const drive = google.drive({
    version: 'v3',
    auth: oauthclient
})

module.exports.veridoDB = catchAsync(async(req, res, next) => {
  
    try {

        console.log(req.file)
    

        const { mimetype, originalname, filename, path } = req.file
        // const { mimetype = 'application/x-sqlite3', originalname, filename, path } = req.body
      //   const { username } = req.session.currentUser;
  
      jwt.verify(req.token, 'secretkey', async(err, data) => {
          if(err){
              res.json({"code": 403, "message": "Auth Failed"})
          } else {
            const response =  await drive.files.create({
                requestBody: {
                    name: filename,
                    mimeType: mimetype
                },
                media: {
                    mimeType: mimetype,
                    body: fs.createReadStream(path)
                }
            })
    
            console.log(response.data)
    
            if(Object.keys(response.data).length){
                const fileID = response.data.id;
                await drive.permissions.create({
                    fileId: fileID,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone'
                    }
                })
        
                const result = await drive.files.get({
                    fileId: fileID,
                    fields: 'webViewLink, webContentLink'
                })
        
                console.log(result.data.webContentLink)
                const user = await User.findOne({username: data.user.username}).populate({
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
                .populate('database')
    
                
    
                
                user.database = result.data.webContentLink;
    
                await user.save();
    
                
                return res.status(200).json({"code": 200, "status": "Ok", "message": "user details", "response": user})
    
            }
          }
      })
        
       
    } catch (e){
        console.log(e.message)
    }
})
module.exports.register = catchAsync(async(req, res, next) => {

    try {
        // const filePath = path.join(__dirname, )
       
        // const filePath = path.join(__dirname, 'flyer.jpg')
        
        console.log(req.file)
        
        
        const { path } = req.file || ''
        let token;
        bcrypt.hash(1234, 12, function(err, hash) {
            token = hash;
        })
        const { full_name = null, email = null, username, password, organization_id = null } = req.body;

        let emailUser;
        // let org_id;

        if(email !== null){
            emailUser = await User.findOne({email : email})
        }
        // console.log(emailUser, 'emailuser')
        // if(organization_id !== null){
        //     org_id = await User.findOne({organization_id : organization_id})
        // }
        // console.log(org_id, 'org_id')

        if(emailUser){
            return res.status(401).json({"code": 401, "status": "Duplicate", "message": `${emailUser.email} is already registered`})
        }
        // if(org_id){
        //     return res.status(401).json({"code": 401, "status": "Duplicate", "message": `${org_id.organization_id} is already registered`})
        // }

        const dateJoined = new Date();
        let date = new Date()
        date.setDate(date.getDate() + 7)


        const newSubcription = new Subscription({
            type: 'trial',
            status: true,
            started: dateJoined.toDateString(),
            expires: date.toDateString()
        })

        const newBusiness = new Business({
            name: null,
            sector : null,
            type : null,
            currency : null,
            currencySymbol : null
        })

        await newBusiness.save()

        await newSubcription.save()
        const user = new User(
            {full_name,
             username, 
             email,
            organization_id, 
            database: null, 
            phoneVerified: false,
             photoUrl: path ? path : null, 
             dateJoined: dateJoined.toDateString(),
              token: null,

        })
        user.subscription_status = newSubcription;
        user.business = newBusiness
        const newUser = await User.register(user, password)


        const Founduser = await User.findOne({username}).populate({
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
        .populate('database')


        req.login(newUser, e => {
            if(e) return next(e)
            res.json({"code": 200, "status": "success", "message": `Successfully registered ${username}`, "response": Founduser})
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
        .populate('database')
        .populate('token')
        
        jwt.sign({user}, 'secretkey', (err, token) => {
            user.token = token;
            user.save();
            return res.status(200).json({"code": 200, "status": "Ok", "message": "Welcome", "response": user})   
        })
       
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
            // const { salt } = req.params;


            // phoneNumber.push({phone: req.body.phoneNumber, salt: salt});

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
           
           

            
           
       } catch (e){
           next(e)
       }
});

module.exports.verifyOTP =  catchAsync(async (req, res, next) => {

    try {

        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const { otp } = req.body; 
                let returnUser;
                // const { salt } = req.params
                console.log(data)
                 
                
                const check = await twilio.verify.services(process.env.VERIFICATION_SID)
                    .verificationChecks
                    // .create({to: number.phone, code: otp})
                    .create({to: data.user, code: otp})
<<<<<<< HEAD
                    .then(async (verification) =>  {
                        if(verification.status === 'approved'){
                            returnUser = await User.findOne({username: data.user})
                            .populate({
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
                            .populate('database')
                            .populate('token')

                            returnUser.phoneVerified = true;
                            returnUser.full_name = returnUser.full_name;
                            await returnUser.save()
                        }
                        res.status(200).json({"code": 200, "status": "Ok", "message": `${verification.status}`, "user": returnUser})
                    })
=======
                    .then(verification => res.status(200).json({"code": 200, "status": "Ok", "message": `${verification.status}`}))
>>>>>>> e3b9ac766db0000ed16e28949091f3ebc6dceb03
                    .catch(e => {
                        next(e)
                        res.status(500).send(e);
                    });
                
                res.status(200).send(check);
            }
        })
       
    } catch (e){
        next(e)
    }
});
