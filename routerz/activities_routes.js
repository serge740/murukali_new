const express = require('express')
const moment = require('moment')
const db = require('../config/db')
const jwt = require('jsonwebtoken')
const { VerifyToken } = require('../config/tokens')

const router = express.Router()



const date = () => {
    return new Date()
}


router.get('/home', VerifyToken , (req, res) => {
    const sql = 'SELECT * FROM murukali.activities';
    db.query(sql, (err, data) => {
        if (err) return res.json(err)
        return res.render('home', { activities: data, moment, currentPath: req.path })
    })
})


router.get('/about', VerifyToken, (req, res) => {
    res.render("about", { currentPath: req.path })
})
router.get('/create', VerifyToken, (req, res) => {
    res.render("create", { currentPath: req.path })
})

router.get('/activitiesPage/:id', VerifyToken, (req, res) => {
    const sql = 'SELECT * FROM murukali.activities WHERE act_id = ?'
    const id = req.params.id
    const message = req.query.message;
    db.query(sql, [id], (err, data) => {
        if (err) return res.json(err)


        db.query('SELECT * FROM murukali.tablez WHERE act_id = ?', [id], (err, dat) => {
            if (err) return res.json(err)

            db.query('SELECT * FROM murukali.columnz LEFT JOIN murukali.tablez ON murukali.columnz.tablez_id = murukali.tablez.tablez_id  WHERE act_id = ?', [id], (er, da) => {
                if (err) return res.json(er)

                db.query('SELECT murukali.rowz.*, murukali.tablez.act_id FROM  murukali.rowz LEFT JOIN murukali.tablez ON murukali.rowz.tables_id = murukali.tablez.tablez_id WHERE murukali.tablez.act_id = ? ORDER BY murukali.rowz.rowz_date ASC', [id], (er, rowz) => {
                    if (err) return res.json(er)


                    db.query('SELECT murukali.columnz.col_id, murukali.rowz.rowz_id, murukali.dataz.dataz_value FROM murukali.columnz LEFT JOIN murukali.dataz ON murukali.columnz.col_id = murukali.dataz.col_id LEFT JOIN murukali.rowz ON murukali.rowz.rowz_id = murukali.dataz.rows_id WHERE murukali.columnz.tablez_id IN (SELECT tablez_id FROM murukali.tablez WHERE act_id = ?)', [id], (er, dataz) => {
                        if (err) return res.json(er)
                    

                        res.render('activities-page', { activity: data[0], tablez: dat[0], columnz: da, dataz: dataz, moment, rowz, currentPath: req.path, message })

                    })
                })

            })
        })

    })
})



router.post('/create', VerifyToken,(req, res) => {
    const { name, purpose, description } = req.body

    const sql = 'INSERT INTO murukali.activities VALUES(?)';
    const id = null
    const values = [id, name, purpose, description, date(),false,req.user.u_id]
    db.query(sql, [values], (err, data) => {
        if (err) return res.json(err)

        return res.json(data)
    })
})



router.delete('/delete/:id', VerifyToken,(req, res) => {
    const sql = 'DELETE FROM murukali.activities WHERE act_id = ? AND u_id =?'
    const id = req.params.id
    db.query(sql, [id,req.user.u_id], (err, data) => {
        if (err) return res.json(err)
        return res.json({ redirect: '/home' })
    })
})


module.exports = router

