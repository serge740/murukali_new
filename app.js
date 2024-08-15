require('dotenv').config()
const express = require('express')
const moment = require('moment')
const morgan = require('morgan')
const mysql = require('mysql')
const activity = require('./routerz/activities_routes')
const tablez = require('./routerz/table_routes')
const Auth = require('./routerz/auths_routes')
const db = require('./config/db')
const cookieParser = require('cookie-parser')
// const { verify } = require('jsonwebtoken')

const cors = require('cors')

const app = express()



app.use(cookieParser())
app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(cors())
app.use(morgan('dev'))
app.use('/' ,activity)
app.use('/', tablez)
app.use('/auth', Auth)




app.use((req, res) => {
    res.redirect('/home')
    
})



app.listen(8000, () => {
    console.log('http://localhost:8000');
})