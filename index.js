if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express');
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const User = require('./models/users/Users')
const cors = require('cors')
const bcrypt = require('bcrypt')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/expressError')
const log = require('morgan');
const logger = require('./logger')
const userRoles = require('./userRoles')
const passport = require('passport')
const passportLocal  = require('passport-local');
const session = require('express-session')
const axios = require('axios')
const Sale = require('./models/users/Sale');
const Customer = require('./models/users/Customers')
const Video = require('./models/users/Videos')
const Supplier = require('./models/users/Supplier')
const Subscription = require('./models/users/Subcription')
const Message = require('./models/admin/Messages')
const UserID = require('./models/users/UserID')
const MoneyOutRoutes = require('./routes/money-out')
const MoneyInRoutes = require('./routes/money-in')
const AdminRoutes = require('./routes/admin')
const AuthRoutes = require('./routes/auth')
const passwordRoutes = require('./routes/password')
const Business = require('./models/users/Business')
const path = require('path')
const fs = require('fs')
const { google } = require('googleapis')
const verifyToken = require('./authenticate')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const {storage} = require('./cloudinary/index')
const cloudinary = require('cloudinary').v2
const upload = multer({ storage })
const STRIPE_LIVE_KEY = process.env.STRIPE_LIVE_KEY
const stripe = require('stripe')(STRIPE_LIVE_KEY);
const Consultant = require('./models/admin/Consultant')
const KEYPATH = ''
const SCOPE = ['https://www.googleapis.com/auth/drive']

const usersMap = []
const el_4 = []

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE


const DB = `mongodb+srv://seinde4:${PASSWORD}@cluster0.pp8yv.mongodb.net/${DATABASE}?retryWrites=true&w=majority` || 'mongodb://localhost:27017/verido';

mongoose.connect(DB,
    {    
    useNewUrlParser: true,
    useUnifiedTopology: true,
    }
)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log('Database connected')
})



app.use(session(sessionConfig))
app.use(cors())
// app.use(express.json())
// app.use(bodyParser())
app.use((req, res, next) => {
    if(req.originalUrl.includes('/webhook')){
        next()
    } else {
        bodyParser()(req, res, next)
    }
})
app.use(log('dev'))
app.use(userRoles.middleware())
app.use(express.urlencoded({extended: true}))


app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', (req, res) => {
    res.send('<h1>Express App is running</h1>')
})

app.use('/money-out', verifyToken, MoneyOutRoutes)
app.use('/money-in', verifyToken, MoneyInRoutes)
app.use(AuthRoutes)
app.use(passwordRoutes)
app.use(AdminRoutes)




app.get('/user-verification', verifyToken, catchAsync( async( req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.status(401).json({"message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate('userID')
                const userid = await UserID.findOne({_id: user.userID.id})
                res.status(200).json({"message": userid})
            }
        })
    } catch(e){
        return next(e)
    }
}))

app.post('/new-consultant', catchAsync( async (req, res, next) => {
    try {
        
        await bcrypt.hash(req.body.password, 12).then(async function(hash){
            
            const consultant = new Consultant({email:req.body.email, username: req.body.username,
                                                mobile_number: req.body.mobile_number, password: hash})
            await consultant.save();
            const user = await Consultant.findOne({email: req.body.email})
            return res.status(200).json({"message": user})
        })
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-consultant', catchAsync( async( req, res, next) => {
    try {
        const { username, password } = req.body;
        const consultant = await Consultant.find().populate({
            path: 'business',
            populate: {
                path: 'business'
            }
        })
        
        
        return res.status(200).json({"consultant": consultant})
        
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-consultant/:id', catchAsync( async (req, res, next) => {
    try {
        const { id } = req.params;
        const consultant = await Consultant.findOne({_id: id}).populate({
            path: 'business',
            populate: {
                path: 'business'
            }
        }).populate({
            path: 'business',
            populate: {
                path: 'subscription_status'
            }
        })

        

        return res.status(200).json({"consultant": consultant})

        
    } catch(e){
        return next(e)
    }
}))


app.post('/new-consultant-message/:consultant', catchAsync( async (req, res, next) => {
    try {
        const { consultant } = req.params;

        const message = new Message({...req.body})

        await message.save();

        const current_consultant = await Consultant.findOne({_id: consultant});
        current_consultant.messages.push(message);

        await current_consultant.save();

        return res.status(200).json({"message": "Ok"})
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-consultant-message/:consultant', (catchAsync( async( req, res, next) => {
    try {
        const { consultant } = req.params;

        const current_consultant = await Consultant.findOne({_id: consultant}).populate('messages');

        if(current_consultant){
            return res.status(200).json({"messages": current_consultant});
        }
    } catch(e){
        return next(e)
    }
})))


app.post('/user-verification', verifyToken, catchAsync( async( req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.status(401).json({"message": "Auth Failed"})
            } else {
                const { BVN, NIN } = req.body;
                const user = await User.findOne({username: data.user}).populate('userID')
                const userid = await UserID.findOneAndUpdate({_id: user.userID.id}, {
                    ...req.body
                })
                const newUserid = await UserID.findOne({_id: user.userID.id}) 

                res.status(200).json({"message": newUserid})
            }
        })
    } catch(e){
        return next(e)
    }
}))

app.post('/admin-verification/:id', catchAsync(async(req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({_id: id}).populate('userID')
        if(user.userID){
            console.log(req.body)
            const new_userID = await UserID.findOneAndUpdate({_id: user.userID._id}, {...req.body})
            .then(async data => {
                const user = await User.findOneAndUpdate({_id: id}, {idVerified: true})

                res.status(200).json({"message": "Ok"})
            })
        } else {
            const new_data = new UserID({
                BVN: req.body.BVN,
                NIN: req.body.NIN
            })

            await new_data.save()
            user.idVerified = true
            user.userID = new_data
            await user.save()
            res.status(200).json({"message": "Ok"})

        }

    } catch (e){
        return next(e)
    }
}))



app.post('/payment',verifyToken, async (req, res, next) => {

    try {
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if(err){
                res.status(401).json({"message": 'Auth Failed'})
            } else {
                const user = await User.findOne({username: data.user})
                console.log(user, data.user)
                let id;
                if(user.stripeCustomerID === null){
                    const customer = await stripe.customers.create({
                        email: user.email ? user.email : null,
                        phone: user.username,
                        name: user.full_name
                    });

                    await User.findOneAndUpdate({username: data.user}, {stripeCustomerID: customer.id})
                    id = customer.id
                } else {
                    id = user.stripeCustomerID
                }

                

                const { plainID } = req.body;
                let amount;
                switch(plainID){
                    case 0:
                        amount = 799
                        break;
                    case 1:
                        amount = 2277
                        break;
                    case 2:
                        amount = 8150
                        break
                    default:
                        amount = 0
                }

                
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount,
                    currency: 'usd',
                    payment_method_types: ['card'],
                });


                // const { id } = customer
                const { client_secret } = paymentIntent

                res.status(200).json({"customer_id": id, "client_secret": client_secret})

            }
        })
       
    } catch (e){
        return next(e)
    }

})

const endpointSecret = "whsec_bGQ3BuM9QbMRjYFX954Ueob2YgOdf8zQ";

app.post('/webhook', express.raw({type: 'application/json'}),  async (request, response) => {

    try {
   
            const sig = request.headers['stripe-signature'];

            let event;
            let date = new Date()

            event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
            switch (event.type) {
                case 'charge.succeeded':
                const charge = event.data.object;
                console.log(event)
                break;
                case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;

                switch(event.data.object.amount_received){
                    case 799:
                        date.setDate(date.getDate() + 28)
                        const user_1 = await User.findOne({stripeCustomerID: event.data.object.customer}).populate('subscription_status')
                        user_1.subscription_status.expires = date.toDateString()
                        await user_1.save()
                        break;
                    case 2277:
                        date.setDate(date.getDate() + 112)
                        const user_2 = await User.findOne({stripeCustomerID: event.data.object.customer}).populate('subscription_status')
                        user_2.subscription_status.expires = date.toDateString()
                        await user_2.save()
                        break;
                    case 8150:
                        date.setDate(date.getDate() + 365)
                        const user_3 = await User.findOne({stripeCustomerID: event.data.object.customer}).populate('subscription_status')
                        user_3.subscription_status.expires = date.toDateString()
                        await user_3.save()
                        break
                    default:
                        console.log('Default')
                        break;

                }
                console.log(event)
                break;
                default:
                console.log(`Unhandled event type ${event.type}`);
            }
            response.send();
        
   
 
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

 
});

app.post('/new-payment', verifyToken, catchAsync(async (req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                return res.status(401).json({"message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate('subscription_status')
                const { amount } = req.body;
                let val;
                let date = new Date();
                let startDate = new Date();
                switch(amount){
                    case 799:
                        val = 28;
                        break;
                    case 2277:
                        val = 112;
                        break;
                    case 8150:
                        val = 365
                        break
                    default:
                        val = 0
                        break
                }
                // const d = new Date(user.subscription_status.expires)
                const d = new Date()
                d.setDate(d.getDate() + val);

                
                const subs = await Subscription.findOneAndUpdate({_id: user.subscription_status.id}, {
                    started: `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}`, //startDate.toDateString(), 
                    expires: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`,//date.toDateString(),
                    type: 'Subscribed'
                })

                const newSub = await Subscription.findOne({_id: user.subscription_status.id})
                res.send(newSub)
                
            }
        })
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-all-product',verifyToken, (req, res, next) => {
  
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if(err){
                throw new Error('Auth failed')
            } else {
                console.log(data.user.username)

                const user = await User.findOne({username: data.user})
                .populate({
                    path: 'product',
                    populate: {
                        path: 'sale'
                    }
                })
                                   
                    if(user.product.length){
                    return res.status(200).json({"code": 200, "status": "ok", "response": {"product": user.product}, "message": "Fetch for all products"})
                    }

                    return res.status(200).json({"code": 200, "status": "ok", "message": "No product saved"})
            }
        })

})

app.post('/fetch-single-product', verifyToken, catchAsync(async (req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if(err){
                throw new Error('Auth Failed')
            } else {
                // const { username } = req.session.currentUser;

        const { product } = req.body;
        const user = await User.findOne({username: data.user}).populate('product');
        let singleProductFound;

        for(let userProduct of user.product){
            if(userProduct.product === product){
                singleProductFound = userProduct
            }
        }
        if(singleProductFound){
            return res.status(200).json({"code": 200, "status": "Ok", "response": singleProductFound})
        } 
        return res.status(200).json({"code": 200, "status": "Ok", "response": 'No Product'})

            }
        })
        // const { id } = req.user;
        
    } catch (e) {
        return next(e)
    }
}))



app.delete('/delete-single-product/:_id',verifyToken, catchAsync( async(req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                throw new Error('Auth failed')
            } else {
                if(req.session.currentUser){
                    const { _id } = req.params;
                    // const { id } = req.
                    // const { username } = req.session.currentUser;
                    
                    const user = await User.findOne({username: data.user}).populate('product');
                    for(let element of user.product){
                        if(element.id === _id){
                            await Product.findByIdAndDelete(_id);
                        }
                    }
                    return res.status(200).json({"code": 200, "status": "Ok", "message": "Deleted"})
                }
            }
        })
        
        
    } catch (e) {
        return next(e)
    }
}))

app.patch('/update-single-product/:_id', verifyToken, catchAsync(async(req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                throw new Error('Auth failed')
            } else {
                if(req.session.currentUser){
                    const { _id } = req.params;
                    // const { id } = req.user;
                    // const { username } = req.session.currentUser;
                    
                    const user = await User.findOne({username: data.user}).populate('product');
                    for(let element of user.product){
                        if(element.id === _id){
                            await Product.findOneAndUpdate(_id, {...req.body})
                        }
                    }
                    // user.product.findByIdAndUpdate(_id, {...req.body})
                    return res.status(200).json({"code": 200, "status": "Ok", "message": "Successfully updated"})
                }
            }
        })
        
        
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-materials', verifyToken, catchAsync(async (req, res, next) => {
    try {
        // const { id } = req.user;
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth failed"})
            } else {
                const user = await User.findOne({username: data.user})
                .populate({
                    path: 'money_in',
                    populate: {
                        path: 'material_assign'
                    }
                })
                const { material_assign } = user.money_in;
                if(material_assign){
                    return res.status(200).json({"code": 200, "status": "ok", "response": material_assign, "message": "Materials saved"})
                }
                return res.status(200).json({"code": 200, "status": "ok", "message": "No material saved"})
            }
        })

        
    } catch (e){
        return next(e)
    }
    
}))

app.post('/new-sale/:_id', verifyToken, catchAsync(async (req, res, next) => {
    try {
        const { _id } = req.params;
        // const { id } = req.user;
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 200, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate({
                    path: 'product',
                    populate: {
                        path: 'sale'
                    }
                });
        
                let available;
                const newSale = new Sale({...req.body});
                await newSale.save();
                for(let product of user.product){
                    if(product.id === _id){
                        available = true
                        product.sale.push(newSale)
                        await product.save()
                    } 
                }
        
                
                return res.status(200).json({"code": 200, "status": "Ok", "message": "New sale succesfully recorded", "response":newSale})
            }
            
        })

        

    } catch (e) {
        return next(e)
    }
}))

app.get('/get-all-customers', verifyToken, catchAsync(async (req, res, next) => {
    try {
        // const { id } = req.user;
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 400, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate('customer');
        const { customer } = user;
        return res.status(200).json({"code": 200, "status": "success", "message": `All customers`, "response": customer})
            }
        })

        
    } catch (e){
        return next(e)
    }
}))

app.post('/add-new-customer', verifyToken, catchAsync(async(req, res, next) => {
    try {
        // const { id } = req.user;
        // const { username } = req.session.currentUser;

        jwt.verify(req.token, async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user})
                const newCustomer = new Customer({...req.body});
                await newCustomer.save();
                user.customer.push(newCustomer);
                await user.save();
                return res.status(200).json({"code": 200, "status": "Ok", "message": "New customer added", "new_customer": newCustomer})
            }
        })
        
    } catch (e){
        return next(e)
    }
}))

app.get('/fetch-all-transactions', verifyToken, catchAsync(async(req, res, next) => {
    try{
        // const { username } = req.session.currentUser;
        // const { id } = req.user;       
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if(err){
                res.json({"code": 403, "message": 'Auth Failed'})
            } else {
                const user = await User.findOne({username: data.user}).populate({
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
                })
               
                return res.status(200).json({"code": 200, "status": "Ok", "message": "Money in transactions for product sale, refund, and other transactions", "response": user})
            }
        })
        
    } catch(e){
        return next(e)
    }
}))


app.post('/add-new-supplier', verifyToken, catchAsync( async( req, res, next) => {
   try {
    // const { id } = req.user;
    // const { username } = req.session.currentUser;
    jwt.verify(req.token, 'secretkey', async(err, data) => {
        if(err){
            res.json({"code": 200, "message": "Auth Failed"})
        } else {
            const user = await User.findOne({username: data.user}).populate({
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
            const newSupplier = new Supplier({...req.body});
            await newSupplier.save()
            user.suppliers.push(newSupplier);
            await user.save();
        
            return res.status(200).json({"code": 200, "status": "Ok", "message": "New Supplier added", "response": user})
        }
    })

   
   } catch (e){
       return next(e)
   }

}))


app.post('/business-information',verifyToken, catchAsync( async(req, res, next) => {
    try {
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate({
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
                const newBusiness = new Business({...req.body});
                await newBusiness.save()
                user.business = newBusiness;
                await user.save()
                return res.status(200).json({"code": 200, "status": "Ok", "message": "Personal Information Updated", "response": user})
            }
        })
        

    }
    catch (e){
        return next(e)
    }
}))

app.get('/get-business-information', verifyToken, catchAsync(async(req, res, next) => {
    try {
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate('business')
                return res.status(200).json({"code": 200, "status": "Ok", "message": "Business information", "response": user.business})
            }
        })
        
    } catch (e){
        return next(e)
    }
}))



app.get('/user', verifyToken, catchAsync(async (req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate({
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
                        model: 'money_out_credit_purchase',
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
                return res.status(200).json({"code": 200, "status": "Ok", "message": "user", "response": user})
            }
        })
        

    } catch(e){
        return next(e)
    }
}))

function uploader(req, res, next){
    if(req.body.image){
        upload.single(req.body.image)
    }
    next()
}

app.post('/update-profile', verifyToken, catchAsync(async(req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message" : "Auth Failed"})
            }else {

                 const {image = null} = req.body;
                 let pathUrl;

                 if(image !== null){
                    await cloudinary.uploader.upload(`data:image/jpg;base64,${image}`, {

                 
                 

                        folder: 'Verido'
                     }, function(err, result) {
                         if(err){
                             console.log(err)

                         }else {

                            pathUrl = result.url
                         }
                    })
                 }
    
                   

                // const profile = await  User.findOneAndUpdate(data.user.username
                const profile = await  User.findOne({username: data.user}
                    //, 
                    // {full_name: req.body.full_name ? req.body.full_name : data.user.username.full_name,
                    // email: req.body.email ? req.body.email : data.user.username.email,
                    // photoUrl: req.file.path ? path : data.user.username.photoUrl,
                        
                    // }
                    ).populate({
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

                const { full_name = null, email = null } = req.body;
                
                
                profile.full_name = full_name === null ? profile.full_name  :  req.body.full_name;
                 profile.email = email === null ? profile.email :  req.body.email;
                profile.photoUrl = pathUrl ? pathUrl : profile.photoUrl;
                await profile.save()
               

                    return res.status(200).json({"code": 200, "status": "Ok", "message": "user", "response": profile})

            }
        })
    }catch (e){
        return next(e)
    }
}))

app.get('/vidoes', catchAsync(async (req, res, next) => {
    try {

        const videos = await Video.find();
        return res.send( videos )
        // return res.status(200).json({"code": 200, "status": "Ok", "response": videos})

    } catch (e){
        return next(e)
    }
}))

app.post('/vidoes', catchAsync(async (req, res, next) => {
    try {

        const video = new Video({...req.body})

        await video.save();
        const videos = await Video.find();
        return res.status(200).json({"code": 200, "status": "Ok", "response": videos})

    } catch (e){
        return next(e)
    }
}))

// app.post('/reset-password', async (req, res) => {
//     const { password } = req.body
//     await User.findOneAndUpdate({username: phoneNumber, { username: }})
// })

app.get('/logout', (req, res) => {
    //MAKE SURE TO DESTROY THE session
    req.logout()
    res.json({"code": 200, "message": "logout"})
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not found', 404))
})

let code;
let status;
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    console.log(err)
    switch(err.name){
        case 'MongoServerError': 
            code = 403;
            status = "Duplicate";
            err.message = `username is already registered`
            // err.message = `${err.keyValue.username} is already registered`
            break;

        case 'ValidationError':
            code = 403;
            status = "Forbidden";
            err.message = `${err._message}`
            break;

        case 'TypeError':
            code = 403;
            status = "Forbidden";
            err.message = 'You must be logged in to proceed'
            break;

        case 'UserExistsError': 
            err.message = "A user with the given Phone number is already registered"
            break;

        default :
            err.message = "Oh no, Something went wrong"
    }
    res.status(code ? code : statusCode).json({"code": code ? code : statusCode, "status": status ? status : "error", "message": err.message })
   
})


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
})
