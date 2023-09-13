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
const generateDeanSchedule = require('./generateDeanSchedule');
const checkStudent = require('./middlewares/checkStudent');

const dotenv = require('dotenv');
const checkDean = require('./middlewares/checkDean');
dotenv.config();

async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/university', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToDatabase();

app.use(bodyParser.json());
app.use('/static', express.static('static')) 
app.use(bodyParser.urlencoded({ extended: true }));

// ENDPOINTS

// Registration route
app.post('/:person/register', async (req, res) => {
    const person = req.params.person;
    const { username, password, universityId } = req.body;
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let newUser;
    if (person === 'dean') {
        newUser = new Dean({ username, password: hashedPassword, universityId });
    }
    else if (person === 'student') {
        newUser = new Student({ username, password: hashedPassword, universityId });
    }
    else {
        return res.send("Invalid URL");
    }
    try {
        const user = await newUser.save();
        console.log(user);
        res.status(201).json({ message: 'User registered successfully. Now Login' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Registration failed. Register Again' });
    }
});

// Login Route
app.post('/:person/login', async (req, res) => {
    const person = req.params.person;

    let user;
    if (person === "dean") {
        user = await Dean.findOne({ username: req.body.username });
    }
    else if (person === "student") {
        user = await Student.findOne({ username: req.body.username });
    }
    else {
        return res.status(404).send({error:"Invalid Url"});
    }
    if (!user) {
        return res.json({msg:"User not found"});
    }
    
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if(!passwordMatch){
        return res.json({error:"Incorrect Password"})
    }

    const userId = user._id;
    const token = jwt.sign({ ...req.body, person, userId }, process.env.JWT_SECRET);
    res.json({ token });
});


app.get('/dean/pendingsessions', validateToken, checkDean, (req, res) => {
    const deanId = req.user.userId;
    Session.find({ deanId, bookedStudent: !null }).then((sessions) => {
        res.json(sessions);
    })
});

app.get('/sessions/:deanId', validateToken, async (req, res) => {
    const deanId = req.params.deanId;
    await Session.find({ deanId, bookedStudent: null }).then(async (sessions) => {
        if (sessions.length == 0) {
            const schedules = generateDeanSchedule(deanId);
            console.log(schedules);
            await Session.insertMany(schedules)
                .then(() => {
                    console.log('Dean\'s schedule inserted successfully.');
                })
                .catch(error => {
                    console.error('Error inserting dean\'s schedule:', error);
                });
            return res.json(schedules);
        }
        else {
            return res.json(sessions);
        }
    })
});


app.post('/book_session', validateToken, checkStudent, (req, res) => {
    console.log("dsfas")
    const { sessionId, studentId } = req.body;
    console.log(sessionId, studentId);
    Session.findById(sessionId).then((session) => {
        console.log(session);
        if (session.bookedStudent !== null) {
            res.json({msg:"Slot already booked"});
        } else {
            session.bookedStudent = studentId;
            session.save();
            res.json({msg:"Booked successfully"});
        }
    }).catch((err) => {
        console.log(err);
    });
});


// START THE SERVER
app.listen(3001, () => {
    console.log(`The application started successfully on port 3001`);
});
