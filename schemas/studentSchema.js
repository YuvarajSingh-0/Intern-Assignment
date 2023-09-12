// student schema with university id and password
const mongoose=require('mongoose');
const studentSchema=new mongoose.Schema({
    name:String,
    universityId:String,
    password:String
});
const Student=mongoose.model('Student',studentSchema);
module.exports=Student;