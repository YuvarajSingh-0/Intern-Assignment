function checkDean(req,res,next){
    if(req.user.person=="dean"){
            next();
    }else{
        res.send("Not a dean"); 
    }
}

module.exports = checkDean;