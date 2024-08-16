const express = require('express')
const moment = require('moment')
const db = require('../config/db')
const jwt = require('jsonwebtoken')
const router = express.Router()


const date = () => {
    return new Date()
}

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', (req, res) => {
    const { u_name, u_password } = req.body
    db.query('SELECT * FROM murukali.userz WHERE u_name = ?  ', [u_name], (err, data) => {

        if (err) return res.json({ message: 'server error', error: err })

        if (data.length === 0) {
            return res.json({ message: 'username doesnt exist', where: 'username' })
        }
        const check = data[0].u_password == u_password
        if (!check) {
            return res.json({ message: 'password doesnt exist', where: 'password' })
        }

        const { u_password: sss, ...others } = data[0]

        const access_token = jwt.sign(others, process.env.ACCESS_TOKEN_SECRET)
        res.cookie('access_token', access_token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 }).json({ message: 'success', redirect: "/home" })
    })

})



router.post('/logout', (req, res) => {
    res.clearCookie('access_token')
        .redirect('/auth/login')
});



module.exports = router