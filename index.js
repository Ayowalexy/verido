if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

const express = require('express');
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const User = require('./models/users/Users')
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
const Supplier = require('./models/users/Supplier')
const MoneyOutRoutes = require('./routes/money-out')
const MoneyInRoutes = require('./routes/money-in')
const AuthRoutes = require('./routes/auth')
const path = require('path')
const fs = require('fs')

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
app.use(express.urlencoded({extended: true}))


app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', (req, res) => {
    res.send('<h1>Express App is running</h1>')
})

app.use('/money-out', MoneyOutRoutes)
app.use('/money-in', MoneyInRoutes)
app.use(AuthRoutes)

app.post('/db-lite', (req, res) => {

    const keys = Object.keys(req.body)
    for(let key of keys){
        fs.writeFileSync('db-lite.txt', 
            key + ':' + req.body[key] + '\n', 
            {
                encoding: "utf-8", 
                flag: "a+", 
                mode: 0o666
            })
    }
    

        const options = {
            root: path.join(__dirname)
        }
        res.sendFile('db-lite.txt', options, function(err){
            if(err){
                console.log(err)
            } else {
                console.log(`Sent`)
            }
        })
})

app.post('/db-lite/:token', (req, res) => {
    console.log(req.files)
})


app.get('/fetch-all-product', catchAsync( async(req, res, next) => {
    try {
        // const { id } = req.user;
        const { username } = req.session.currentUser;

        const user = await User.findOne({username})
                            .populate({
                                path: 'product',
                                populate: {
                                    path: 'sale'
                                }
                            })
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

app.post('/fetch-single-product', catchAsync(async(req, res, next) => {
    try {
        // const { id } = req.user;
        const { username } = req.session.currentUser;

        const { product } = req.body;
        const user = await User.findOne({username}).populate('product');
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
        if(req.session.currentUser){
            const { _id } = req.params;
            // const { id } = req.
            const { username } = req.session.currentUser;
            
            const user = await User.findOne({username}).populate('product');
            for(let element of user.product){
                if(element.id === _id){
                    await Product.findByIdAndDelete(_id);
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
        if(req.session.currentUser){
            const { _id } = req.params;
            // const { id } = req.user;
            const { username } = req.session.currentUser;

            const user = await User.findOne({username}).populate('product');
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
        // const { id } = req.user;
        const { username } = req.session.currentUser;

        const user = await User.findOne({username}).populate('material_assign');
        const { material_assign } = user;
        if(material_assign){
            return res.status(200).json({"code": 200, "status": "ok", "response": material_assign, "message": "Materials saved"})
        }
        return res.status(200).json({"code": 200, "status": "ok", "message": "No material saved"})
    } catch (e){
        return next(e)
    }
    
}))

app.post('/new-sale/:_id', catchAsync(async (req, res, next) => {
    try {
        const { _id } = req.params;
        // const { id } = req.user;
        const { username } = req.session.currentUser;

        const user = await User.findOne({username}).populate({
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

        
        return res.status(200).json({"code": 200, "status": "Ok", "message": "New sale succesfully recorded"})

    } catch (e) {
        return next(e)
    }
}))

app.get('/get-all-customers', catchAsync(async (req, res, next) => {
    try {
        // const { id } = req.user;
        const { username } = req.session.currentUser;

        const user = await User.findOne({username}).populate('customer');
        const { customer } = user;
        return res.status(200).json({"code": 200, "status": "success", "message": `All customers for ${user.full_name}`, "response": customer})
    } catch (e){
        return next(e)
    }
}))

app.post('/add-new-customer', catchAsync(async(req, res, next) => {
    try {
        // const { id } = req.user;
        const { username } = req.session.currentUser;

        const user = await User.findOne({username})
        const newCustomer = new Customer({...req.body});
        await newCustomer.save();
        user.customer.push(newCustomer);
        await user.save();
        return res.status(200).json({"code": 200, "status": "Ok", "message": "New customer added", "new_customer": newCustomer})
    } catch (e){
        return next(e)
    }
}))

app.get('/fetch-all-transactions', catchAsync(async(req, res, next) => {
    try{
        const { username } = req.session.currentUser;
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
        })
       
        return res.status(200).json({"code": 200, "status": "Ok", "message": "Money in transactions for product sale, refund, and other transactions", "response": user})
    } catch(e){
        return next(e)
    }
}))








app.post('/add-new-supplier', catchAsync( async( req, res, next) => {
   try {
    // const { id } = req.user;
    const { username } = req.session.currentUser;

    const user = await User.findOne({username}).populate('suppliers');
    const newSupplier = new Supplier({...req.body});
    await newSupplier.save()
    user.suppliers.push(newSupplier);
    await user.save();

    return res.status(200).json({"code": 200, "status": "Ok", "message": "New Supplier added", "response": newSupplier})
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
            err.message = `${err.keyValue.username} is already registered`
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