if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

const {TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN} = process.env
const express = require('express');
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const User = require('./models/Users')
const bcrypt = require('bcrypt')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/expressError')
const twilio = require('twilio')(TWILO_ACCOUNT_SID, TWILO_AUTH_TOKEN);
const log = require('morgan');
const logger = require('./logger')
const userRoles = require('./userRoles')
const passport = require('passport')
const passportLocal  = require('passport-local');
const session = require('express-session')
const axios = require('axios')
const Product = require('./models/Product')
const Material = require('./models/Materials')
const Labour = require('./models/Labour')

const usersMap = []


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

app.use(express.json())
app.use(bodyParser())
app.use(log('dev'))
app.use(userRoles.middleware())


app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.get('/', (req, res) => {
    res.send('<h1>Express App is running</h1>')
})

function wrapAsync(fn){
    return function(next, req){
        fn(next, req).catch(e => next(e))
    }
}

app.post('/register', catchAsync(async(req, res, next) => {

    try {
        const { full_name, email, username, password, organization_id } = req.body;

        const emailUser = await User.findOne({email})

        if(emailUser){
            return res.status(401).json({"code": 401, "status": "Duplicate", "message": `${emailUser.email} is already registered`})
        }

        const user = new User({full_name, username, email, username, organization_id})
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
       
}))

app.get('/login', (req, res) => {
    res.json({"code": 401, "status": "Unauthorized", "message": "Phone number or password is incorrect"})
})

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}),  async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({username})
    if(user){
        return res.json({"code": 200, "status": "success", "message": `Welcome ${user.full_name}`})
    }

})

let phoneNumber;
let foundUser;

 app.post('/send-verification', catchAsync(async (req, res) => {
        

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
}));

  
app.post('/verify-otp', catchAsync(async (req, res) => {

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
}));

app.post('/add-product', catchAsync(async (req, res, next) => {

   try {
       const { id } = req.user;
       const { product } = req.body;
       const user = await User.findOne({id}).populate('product')
        console.log(user.product)
      if(user.product.length){
        for(let userProduct of user.product ){
            if(userProduct.product === product){
                //PRODUCT ALREADY EXISTS, THIS WILL CREATE A DUPLICATE OF THE PRODUCT;
               return res.status(403).json({"code": 403, "status": "Duplicate", "message": `A product with name ${product} already exist`})
            } 
       }
       const newProduct = new Product({...req.body});
       user.product.push(newProduct);
       await user.save();
      } 

      const firstProduct = new Product({...req.body});
      await firstProduct.save()
      user.product.push(firstProduct)
      await user.save();

       
       res.status(200).json({"code": 200, "status": "Ok", "message": "New Product Scuccessfully added"})
    } catch (e){
        next(e)
    }
}))

app.post('/add-material', catchAsync(async (req, res, next) => {
    try {
        const { id } = req.user;
        const { material } = req.body;
        const user = await User.findOne({id}).populate('material_assign')
         console.log(user.material_assign)
       if(user.material_assign.length){
         for(let userMaterial of user.material_assign ){
             if(userMaterial.material === material){
                 //PRODUCT ALREADY EXISTS, THIS WILL CREATE A DUPLICATE OF THE PRODUCT;
                return res.status(403).json({"code": 403, "status": "Duplicate", "message": `A Material with name ${material} already exist`})
             } 
        }
        const newMaterial = new Material({...req.body});
        user.material_assign.push(newMaterial);
        await user.save();
       } 
 
       const firstMaterial = new Material({...req.body});
       await firstMaterial.save()
       user.material_assign.push(firstMaterial)
       await user.save();
 
        
        res.status(200).json({"code": 200, "status": "Ok", "message": "New Material Scuccessfully added"})
     } catch (e){
         next(e)
     }
   
 }))


app.post('/add-labour', catchAsync(async (req, res, next) => {
    try {
        const { id } = req.user;
        const { labour } = req.body;
        const user = await User.findOne({id}).populate('labour_assign')
         console.log(user.labour_assign)
       if(user.labour_assign.length){
         for(let userLabour of user.labour_assign ){
             if(userLabour.labour === labour){
                 //PRODUCT ALREADY EXISTS, THIS WILL CREATE A DUPLICATE OF THE PRODUCT;
                return res.status(403).json({"code": 403, "status": "Duplicate", "message": `A Labour with name ${labour} already exist`})
             } 
        }
        const newLabour = new Labour({...req.body});
        user.labour_assign.push(newLabour);
        await user.save();
       } 
 
       const firstLabour = new Labour({...req.body});
       await firstLabour.save()
       user.labour_assign.push(firstLabour)
       await user.save();
 
        
        res.status(200).json({"code": 200, "status": "Ok", "message": "New Labour Scuccessfully added"})
     } catch (e){
         next(e)
     }
   
 }))


app.get('/fetch-all-product', catchAsync( async(req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findOne({id})
                            .populate('product')
                            .populate('material_assign')
                            .populate('labour_assign')
                            .populate('customer')
        const { product } = user;
        console.log(user.product)
        if(product){
           return res.status(200).json({"code": 200, "status": "ok", "response": {"product": product, "user": user}, "message": "Fetch for all products"})
        }

        return res.status(200).json({"code": 200, "status": "ok", "message": "No product saved"})
    } catch (e){
        return next(e)
    }
}))

app.post('/fetch-single-product', catchAsync(async(req, res) => {
    try {
        const { id } = req.user;
        const { product } = req.body;
        const user = await User.findOne({id});
        let singleProductFound;

        for(let userProduct of user.product){
            if(userProduct.product === product){
                singleProductFound = userProduct
            }
        }
        if(singleProductFound){
            return res.status(200).json({"code": 200, "status": "Ok", "response": singleProductFound})
        } 
    } catch (e) {
        return next(e)
    }
}))



app.delete('/delete-single-product/:_id', catchAsync( async(req, res, next) => {
    try {
        if(req.user){
            const { _id } = req.params;
            const { id } = req.user;
            const user = await User.findOne({id}).populate('product');
            for(let element of user.product){
                if(element.id === _id){
                    await Product.findByIdAndDelete(_id, {...req.body})
                }
            }
            return res.status(200).json({"code": 200, "status": "Ok", "message": "Deleted"})
        }
        
    } catch (e) {
        return next(e)
    }
}))

app.patch('/update-single-product/:_id', catchAsync(async(req, res, next) => {
    try {
        if(req.user){
            const { _id } = req.params;
            const { id } = req.user;
            const user = await User.findOne({id}).populate('product');
            for(let element of user.product){
                if(element.id === _id){
                    await Product.findOneAndUpdate(_id, {...req.body})
                }
            }
            // user.product.findByIdAndUpdate(_id, {...req.body})
            return res.status(200).json({"code": 200, "status": "Ok", "message": "Successfully updated"})
        }
        
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-materials', catchAsync(async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findOne({id}).populate('material_assign');
        const { material_assign } = user;
        if(material_assign){
            return res.status(200).json({"code": 200, "status": "ok", "response": material_assign, "message": "Materials saved"})
        }
        return res.status(200).json({"code": 200, "status": "ok", "message": "No material saved"})
    } catch (e){
        return next(e)
    }
    
}))



// app.post('/reset-password', async (req, res) => {
//     const { password } = req.body
//     await User.findOneAndUpdate({username: phoneNumber, { username: }})
// })
      

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
            err.message = `${err.keyValue.username} is already registered`
            break;

        case 'ValidationError':
            code = 403;
            status = "Forbidden";
            err.message = `${err._message}`
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