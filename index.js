if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express');
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const User = require('./models/Users')
const bcrypt = require('bcrypt')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/expressError')

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

app.use(express.json())
app.use(bodyParser())


app.get('/', (req, res) => {
    res.send('<h1>Express App is running</h1>')
})

function wrapAsync(fn){
    return function(next, req){
        fn(next, req).catch(e => next(e))
    }
}

app.post('/register', catchAsync(async(req, res, next) => {

    const { full_name, phone_number, email_address, password, organization_id } = req.body;
    const hash = bcrypt.hashSync(password, 12);
    const user = new User({full_name, password: hash, phone_number, username: email_address, organization_id})
    await user.save()


}))

app.post('/login', catchAsync(async (req, res) => {

    const { phone_number, password } = req.body;
        const user = await User.findOne({phone_number}) 

        if(user){
            let result = bcrypt.compareSync(password, user.password);
                if(result){
                    res.json({"code": 200, "status": "success", "message": `Welcome ${user.full_name}`})
                } else if(result === false) {
                    res.json({"code": 401, "status": "Unauthorized", "message": "Phone number or password is incorrect"})
                } else {
                    res.json({"code": 504, "status": "Gateway timeout", "message": "Error occured, please try again"})
                }
        } else {
            res.json({"code": 400, "status": "Unauthorized", "message": `There is no account associated with ${phone_number}, create a new account now`})
        }
}))


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    console.log(err, '===================')
    //if(!err.message) err.message = 'Oh no, Something went wrong'

    switch(err.name){
        case 'MongoServerError': 
            err.message = `${err.keyValue.username} is already registered`
            break;

        case 'ValidationError':
            err.message = `${err._message}`
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