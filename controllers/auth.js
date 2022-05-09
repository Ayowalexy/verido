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
const Video = require('../models/users/Videos')
const userID = require('../models/users/UserID')
const Institution = require('../models/users/Institution')
const Consultants = require('../models/admin/Consultant')
const STRIPE_LIVE_KEY = process.env.STRIPE_LIVE_KEY
const stripe = require('stripe')(STRIPE_LIVE_KEY);
const shortUrl = require("node-url-shortener");

if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

const AWS = require('aws-sdk');


module.exports.veridoDB = catchAsync(async (req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async function (err, data){
            if(err){
                res.json({"message": "Auth Failed"})
            } else {
                const spacesEndpoint = new AWS.Endpoint('sfo3.digitaloceanspaces.com');
                const s3 = new AWS.S3({
                    endpoint: spacesEndpoint,
                    accessKeyId: 'Z3UR6ESXJR6WTYKLUTWG' || process.env.SPACES_KEY, 
                    secretAccessKey: '0KWt/hsyoKDsb16q8cmCNoqFsugsgxx3g3+UJ4QU3TI' || process.env.SPACES_SECRET 
                    // accessKeyId: '43HT5DWBCV3XA3LLQJM7' || process.env.SPACES_KEY, 
                    // secretAccessKey: 'A7gyjuwBizzk56luyeFYcyJDa/f0CO8Z+A9iK1CtrXA' || process.env.SPACES_SECRET 
                });
        
                // 
                // 
                // var params = {
                //     Bucket: "verido-files"
                // };
        
                // s3.createBucket(params, function(err, data) {
                //     if (err) console.log(err, err.stack);
                //     else     console.log(data);
                // });
        
                // s3.listBuckets({}, function(err, data) {
                //     if (err) console.log(err, err.stack);
                //     else {
                //         data['Buckets'].forEach(function(space) {
                //             console.log(space['Name']);
                //         })
                //     };
                // });

                console.log('Bucket')
                const { mimetype, originalname, filename, path } = req.file
        
        
                var params = {
                    Bucket: "verido-files",
                    Key: `${originalname}`,
                    Body: fs.createReadStream(path),
                    ACL: "private",
                    Metadata: {
                                "x-amz-meta-my-key": "your-value"
                            }
                };
        
                s3.putObject(params, function(err, data) {
                    if (err) {console.log(err, err.stack);}
                    else     {console.log(data);}
                });
        
                const expireSeconds = 600000000000
        
                const url = s3.getSignedUrl('getObject', {
                    Bucket: 'verido-files',
                    Key: `${originalname}`,
                    Expires: expireSeconds
                });
        
                await User.findOneAndUpdate({username: data.user},{database: url})
                        const user = await User.findOne({username:data.user}).populate({
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
            
        
                console.log(url);
                return res.status(200).json({"code": 200, "status": "Ok", "message": "user details", "response": user})

            }
        })
        

    } catch(e){
        return next(e)
    }

    // res.send('success')
})
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

module.exports.sms_text = catchAsync( async (req, res, next) => {
    try {
        const { phone_number, amount_due, amount_paid, outstanding_balance, number_of_payment, payment_frequency, next_payment_date } = req.body;
        jwt.verify(req.token, 'secretkey',async (err, data) => {
            if(err){
                return res.status(401).json({"message": 'Auth Failed'})
            } else {
                // const spacesEndpoint = new AWS.Endpoint('sfo3.digitaloceanspaces.com');
                // const s3 = new AWS.S3({
                //     endpoint: spacesEndpoint,
                //     accessKeyId: '43HT5DWBCV3XA3LLQJM7' || process.env.SPACES_KEY, 
                //     secretAccessKey: 'A7gyjuwBizzk56luyeFYcyJDa/f0CO8Z+A9iK1CtrXA' || process.env.SPACES_SECRET 
                // });
        
        
                // const { mimetype, originalname, filename, path } = req.file
        
        
                // var params = {
                //     Bucket: "verido-receipt",
                //     Key: `${originalname}`,
                //     Body: fs.createReadStream(path),
                //     ACL: "private",
                //     Metadata: {
                //                 "x-amz-meta-my-key": "your-value"
                //             }
                // };
        
                // s3.putObject(params, function(err, data) {
                //     if (err) {console.log(err, err.stack);}
                //     else     {console.log(data);}
                // });
        
                // const expireSeconds = 600000000000
        
                // const url_link = s3.getSignedUrl('getObject', {
                //     Bucket: 'verido-receipt',
                //     Key: `${originalname}`,
                //     Expires: expireSeconds
                // });

                const user = await User.findOne({username: data.user}).populate('business')
                    console.log(user)
                    if(user == null){
                        return res.status(403).json({"code": 403, "status": "Authorised", "message": `User with ${req.body.phoneNumber} is not registered`})
                    }
        
                    // shortUrl.short(url_link, function (err, url) {
                        twilio.messages
                        .create({
                           body: `Credit transaction with ${user.business.name ? user.business.name : 'A verido business'} \nAmount Due: ${amount_due}\nAmount Paid: ${amount_paid}\nOutstanding Balance: ${outstanding_balance}\nAgreed Number of payments: ${number_of_payment}\nPayment Frequency: ${payment_frequency}\nNext Payment Date: ${next_payment_date}\n\n For Enquiries about this transaction, contact ${user.business.name ? user.business.name : 'This Verido Business'} at ${user.username}  \n\nMessage generated with Verido \nhttps://verido.app`,
                           from: '+447401123846',
                           to: phone_number
                         })
                        .then(message => console.log(message.sid))
                        .catch(e => console.log(e))
                       
                      res.status(200).json({"message": "Message Delivered"})
                    // });
                    
                   
            }
        })
    } catch (e){
        return next(e)
    }
})

module.exports.digitalOcean = catchAsync(async(req, res, next) => {
  
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
                await User.findOneAndUpdate({username: data.user},{database: result.data.webContentLink})
                const user = await User.findOne({username:data.user}).populate({
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
                .populate('videos')
                .populate('insitution')
                .populate('consultant')

    
                
    
                
               // user.database = result.data.webContentLink;
    
               // await user.save();
    
                
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
        const { 
            full_name = null, 
            email = null, 
            username,
             consultantID, 
             password, 
             organization_id = null,
             business_name = null,
            business_sector = null,
            business_type = null,

             } = req.body;

        let emailUser;
        // let org_id;
        let exits;
        if(email !== null){
            emailUser = await User.findOne({email : email})
        }
        if(username !== null){
            exits = await User.findOne({username : username})
        }
        // console.log(emailUser, 'emailuser')
        // if(organization_id !== null){
        //     org_id = await User.findOne({organization_id : organization_id})
        // }
        // console.log(org_id, 'org_id')

        if(emailUser){
            return res.status(401).json({"code": 401, "status": "Duplicate", "message": `${emailUser.email} is already registered`})
        }
         if(exits){
            return res.status(401).json({"code": 401, "status": "Duplicate", "message": `${exits.username} is already registered`})
        }
        // if(org_id){
        //     return res.status(401).json({"code": 401, "status": "Duplicate", "message": `${org_id.organization_id} is already registered`})
        // }

        

        const dateJoined = new Date();
        let date = new Date()
        date.setDate(date.getDate() + 7)

        const newInstitution = new Institution({
            name: null,
            email: null,
            institutionShouldAccessData: null,
            institutionShouldExportData: null
        })
        
       
       

        const newSubcription = new Subscription({
            type: 'trial',
            status: true,
            started: `${dateJoined.getMonth()+1}/${dateJoined.getDate()}/${dateJoined.getFullYear()}`,// dateJoined.toDateString(),
            expires: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`//date.toDateString()
        })


        const newBusiness = new Business({
            name: business_name,
            sector : business_sector,
            type : business_type,
            currency : 'US Dollar',
            currencySymbol : '$'
        })


        await newInstitution.save()

        await newBusiness.save()

        await newSubcription.save()

        

        const customer = await stripe.customers.create({
            email: email ? email : null,
            phone: username,
            name: full_name
        });
        const user = new User(
            {full_name,
             username, 
             email,
             stripeCustomerID: customer.id,
            organization_id, 
            database: null, 
            phoneVerified: false,
             photoUrl: path ? path : null, 
             dateJoined: dateJoined.toDateString(),
              token: null,
            //   consultant: consultantID

        })
        user.subscription_status = newSubcription;
        user.business = newBusiness
        user.insitution.push(newInstitution)
        // const newUser = await User.register(user, password)
        
        await bcrypt.hash(password, 12).then(function(hash){
            user.password = hash
        })



        const consultant = await Consultants.findOne({
            consultant_id: consultantID
        })

        if(consultant){
            consultant.business.push(user)
            user.consultant.push(consultant)
            await consultant.save()
        }

        await user.save()


        
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
        .populate('consultant')


        req.login(user, e => {
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

        
        const { username, password } = req.body;
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
    .populate('videos')
    .populate('insitution')
    .populate('consultant')
console.log(user !== null && !(user.suspended))

if(user !== null){
    await bcrypt.compare(password, user.password).then(function(result){
        switch(result){
            case true: 
                jwt.sign({user: user.username}, 'secretkey', (err, token) => {
                    user.token = token;
                    user.save();
                    return res.status(200).json({"code": 200, "status": "Ok", "message": "Welcome", "response": user})   
                })
                break;
            case false: 
                return res.status(200).json({"code": 403, "status": "Failed", "message": "Username or password is incorrect"})   
                break;

            default: 
                return res.status(200).json({"code": 403, "status": "Failed", "message": "Username or password is incorrect"})   
                break;
        }
    })
}
    req.session.currentUser = req.body;

    res.status(400).json({"message": "User is not available"})

    //if(user){
       // const { username } = req.session.currentUser;
        // const { id } = req.user;       
        //const user = await User.findOne({username})
        
       
       
   // }
    
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


                    .then(verification => res.status(200).json({"code": 200, "status": "Ok", "message": `${verification.status}`}))

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
