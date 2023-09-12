const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
    week: String,
    day: String,
    time: String,
    deanId: String,
    bookedStudent: String
});
const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;