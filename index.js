const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validateToken = require('./middlewares/validateToken');
const saltRounds = 10;

const mongoose = require('mongoose');
const Dean = require('./schemas/deanSchema');
const Session = require('./schemas/sessionSchema');
const Student = require('./schemas/studentSchema');

const dotenv = require('dotenv');
dotenv.config();

async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/university', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully');
        // Perform database operations here
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToDatabase();

// EXPRESS SPECIFIC STUFF
app.use(bodyParser.json());
app.use('/static', express.static('static')) // For serving static files
app.use(bodyParser.urlencoded({ extended: true }));
// ENDPOINTS

// Registration route
app.post('/dean/register', async (req, res) => {
    const { name, password, universityId } = req.body;
    console.log(req.body)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new Dean({ name, password: hashedPassword, universityId });
    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully. Now Login' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Registration failed. Register Again' });
    }
});

// Example route for user login
app.post('/dean/login', (req, res) => {
    // Replace this with your actual user authentication logic
    // const user = { name: "dean", password: "dean123" };
    // const { name,universityId, password } = req.body;
    const user = req.body;
    const token = jwt.sign(user, process.env.JWT_SECRET);
    res.json({ token });
});

app.get('/sessions', validateToken, (req,res)=>{
    Session.find({}).then((sessions)=>{
        res.send(sessions);
    })
});

app.post('/book_session/:sid/:studentId', validateToken, (req,res)=>{
    const sid = req.params.sid;
    const studentId = req.params.studentId;
    Session.findById(sid).then((session)=>{
        if(session.bookedStudent !== null){
            res.send("Student already booked");
        }else{
            session.bookedStudent = studentId;
            session.save();
            res.send("Booked successfully");
        }
    })
});


// START THE SERVER
app.listen(3001, () => {
    console.log(`The application started successfully on port 3001`);
});
