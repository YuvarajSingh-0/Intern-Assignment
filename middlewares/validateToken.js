const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const secretKey = process.env.JWT_SECRET;

// Middleware for token verification
function validateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token format
    if (!token) {
        console.log("token not found")
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.log(err)
            return res.sendStatus(403); // Forbidden, token is invalid
        }
        req.user = user; 
        next(); 
    });
}

module.exports = validateToken;

