if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express');
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const User = require('./models/Users')
const bcrypt = require('bcrypt')

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

app.use(express.json())
app.use(bodyParser())


app.get('/', (req, res) => {
    res.send('<h1>Express App is running</h1>')
})

app.post('/register',  (req, res) => {
    const { full_name, phone_number, email_address, password, organization_id } = req.body;
    try {
        bcrypt.hash(password, 12, async function(err, hash) {
            const user = new User({full_name, password: hash, phone_number, username: email_address, organization_id})
            await user.save()

            res.send(`${full_name}, account created`)
        });
    
    } catch (e){
        console.log(e)
        res.send('Error in creating user')
    }


})

app.post('/login', async (req, res) => {

    const { phone_number, password } = req.body;

    try {
        const user = await User.findOne({phone_number}) 

        if(user){
            bcrypt.compare(password, user.password, function(err, result) {
                if(result){
                     res.send(`Welcome ${user.full_name}`)
                 } else if(result === false) {
                     res.send('Phone number or password is incorrect')
                 } else {
                     res.send('Error occured, please try again')
                 }
            });
        } else {
            res.send(`There is no account associated with ${phone_number}, create a new account now`)
        }
    } catch (e){
        console.log(e)
        res.send('Error Logging in, Please try again')
    }
})


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
})