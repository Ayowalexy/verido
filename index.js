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
const twilio = require('twilio')(TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN);
const log = require('morgan');
const logger = require('./logger')
const userRoles = require('./userRoles')
const passport = require('passport')
const passportLocal  = require('passport-local');
const session = require('express-session')


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

mongoose.connect('mongodb://localhost:27017/verido', 
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
    const { phone_number } = req.body;
    const user = await User.findOne({phone_number})
    if(user){
        return res.json({"code": 200, "status": "success", "message": `Welcome ${user.full_name}`})
    }
   // throw new Error("Phone number or password is incorrect")
})


app.get('/reset-password', async (req, res) => {

    // const { channel, phoneNumber } = req.body

    let verificationRequest;

    try {
        verificationRequest = await twilio.verify.services(VERIFICATION_SID)
          .verifications
          .create({ to: 08145405006, channel: 'phone' });
      } catch (e) {
        // logger.error(e);
        console.log(e)
        return res.status(500).send(e);
      }

    console.log(verificationRequest);
    // logger.debug(verificationRequest);

    return res.render('verify')
})

app.post('/reset-password', async(req, res) => {
    const { verificationCode } = req.body;

    try {
        verificationResult = await twilio.verify.services(VERIFICATION_SID)
          .verificationChecks
          .create({ verificationCode, to: 08145405006 });
      } catch (e) {
        console.log(e);
        // logger.error(e);
        return res.status(500).send(e);
      }
    
      console.log(verificationResult);
    //   logger.debug(verificationResult);
    
      if (verificationResult.status === 'approved') {
        // req.user.role = 'access secret content';
        // await req.user.save();
        // return res.redirect('/');
        res.send('input correct')
      }
    
    //   errors.verificationCode = `Unable to verify code. status: ${verificationResult.status}`;
    //   return res.render('verify', { title: 'Verify', user: req.user, errors });
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    switch(err.name){
        case 'MongoServerError': 
            err.message = `${err.keyValue.username} is already registered`
            break;

        case 'ValidationError':
            err.message = `${err._message}`
            break;

        case 'UserExistsError': 
            err.message = ' A user with the given Phone number is already registered'
            break;
        default :
            err.message = 'Oh no, Something went wrong'
    }
    res.status(statusCode).send({"code": statusCode, "status": "error", "message": err.message })
   
})


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
})