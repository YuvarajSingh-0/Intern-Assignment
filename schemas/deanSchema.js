const mongoose = require('mongoose');
const deanSchema = new mongoose.Schema({
    username: String,
    universityId: String,
    password: String
});
const Dean = mongoose.model('Dean', deanSchema);
module.exports = Dean;