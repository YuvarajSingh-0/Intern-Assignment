function checkStudent(req,res,next){
    console.log(req.user.person);
    if(req.user.person!=="student"){
        return res.send("Not a student");
    }
    next();
}

module.exports = checkStudent;