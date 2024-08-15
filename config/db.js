
require('dotenv').config()
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const { env } = require('process');

const sslCertPath = path.resolve(__dirname, 'ca.pem');

if (!fs.existsSync(sslCertPath)) {
    console.error('SSL certificate file not found at:', sslCertPath);
    process.exit(1);
}


const sslCert = fs.readFileSync(sslCertPath);




const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DBNAME,
    port:process.env.DB_PORT,
    ssl: {
        ca: sslCert,
        rejectUnauthorized: true
    }
});

db.connect(err => {
    if (err) {
        console.error('Connection error:', err);
        return;
    }
    console.log('Successfully connected to the Aiven MySQL database!');
});





// const db = mysql.createConnection({
//     host:process.env.DB_HOST,
//     user:process.env.DB_USER,
//     password:process.env.DB_PASSWORD,
//     database:process.env.DB_DBNAME
// })



module.exports = db

