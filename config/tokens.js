const jwt = require('jsonwebtoken');

const VerifyToken = (req, res, next) => {
    const access_token = req.cookies.access_token;
    
    if (!access_token) {
        return provideToken(req, res, next); // Pass `next` to `provideToken` to control the flow
    }

    jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return provideToken(req, res, next); // Attempt to provide a new token if verification fails
        }
        
        req.user = decoded;
        next();
    });
};

const provideToken = (req, res, next) => {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
        return res.redirect('/auth/login');
    }

    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json('Invalid refresh token');

        // Generate a new access token
        const access_token = jwt.sign(
            { u_id: decoded.id, u_name: decoded.u_name }, // assuming these fields exist in the token
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' } // set a reasonable expiration time, such as 15 minutes
        );

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000 // 15 minutes in milliseconds
        });

        // Call next() to continue the middleware chain after setting the token
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
    provideToken,
    VerifyToken
};
