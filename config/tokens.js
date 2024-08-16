const jwt = require('jsonwebtoken');

const VerifyToken = (req, res, next) => {
    const access_token = req.cookies.access_token;
    
    if (!access_token) {
        return res.redirect('/auth/login');
    }

    jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return provideToken(req, res, next); // Attempt to provide a new token if verification fails
        }
        
        req.user = decoded;
        next();
    });
};



// const db = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"actival"
// })


module.exports = {
    VerifyToken
};
