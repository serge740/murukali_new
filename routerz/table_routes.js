const express = require('express')
const moment = require('moment')
const db = require('../config/db')
const { VerifyToken } = require('../config/tokens')


const router = express.Router()


const date = () => {
    return new Date()
}

// give the page to create the table

router.get('/create-table/:id',VerifyToken, (req, res) => {
    res.render('create-table', { id: req.params.id, currentPath: req.path })
})



router.get('/create-column/:id', VerifyToken, (req, res) => {
    db.query('SELECT * FROM murukali.tablez WHERE tablez_id = ?', [req.params.id], (err, dat) => {
        if (err) return res.json(err)
        res.render('create-column', { tableId: req.params.id, table: dat[0], currentPath: req.path })

    })
})

// create the column
router.post('/create-column', VerifyToken, (req, res) => {
    const { isDate, isDay, columns } = req.body;

    const insertQueries = columns.map(({ column_name, isType, isTotal, table_id }) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO murukali.columnz VALUES(?)';
            const id = null;
            const values = [id, column_name, isType, isTotal, false, table_id];
            db.query(sql, [values], (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    });

    Promise.all(insertQueries)
        .then(() => {
            const table_id = columns[0].table_id; // Assuming all columns belong to the same table
            const q = 'UPDATE murukali.tablez SET isDate = ? , isDay = ? ,isColumn = ? WHERE tablez_id = ?';
            db.query(q, [isDate, isDay, true, table_id], (err, da) => {
                if (err) return res.json(err);

                db.query('SELECT * FROM murukali.tablez WHERE tablez_id = ?', [table_id], (err, dat) => {
                    if (err) return res.json(err);
                    return res.json(`/activitiesPage/${dat[0].act_id}?message=you have created columns successfully`);
                });
            });
        })
        .catch(err => res.json(err));
});



// create the table

router.post('/create-table', VerifyToken,   (req, res) => {
    const { name, description, act_id } = req.body

    const sql = 'INSERT INTO murukali.tablez(tablez_id,tablez_name,tablez_desc,tablez_date,act_id) VALUES(?)';
    const id = null
    const values = [id, name, description, date(), act_id]
    db.query(sql, [values], (err, data) => {
        if (err) return res.json(err)

        db.query('UPDATE murukali.activities SET isTable = ? WHERE act_id = ?', [true, act_id], (er, dat) => {
            if (er) return res.json(er)
                console.log(dat);
                
            return res.json(dat)
        })
    })
})

// get page that change the name of the column

router.get('/change-column/:id',VerifyToken, (req,res)=>{

    const sql = 'SELECT col_name FROM murukali.columnz WHERE col_id = ?'

    db.query(sql,[req.params.id],(err,data)=>{
        if(err) return res.json(data)

        return res.render('change-column',{col:data[0],id:req.params.id,currentPath:`/change-column/${req.params.id}`})
    })

})

router.put('/change-column/:id',VerifyToken, (req,res)=>{
    const {name} = req.body
    const sql = 'UPDATE murukali.columnz SET col_name = ? WHERE col_id = ?'
    db.query(sql,[name,req.params.id],(err,data)=>{
        if(err) return res.json(err)

        return res.json(data)
    })
})

// get page to add data in the table
router.get("/add-data/:id", VerifyToken, (req, res) => {


    const sql = 'SELECT * FROM murukali.columnz LEFT JOIN murukali.tablez ON murukali.tablez.tablez_id = murukali.columnz.tablez_id WHERE act_id = ? '

    db.query(sql, [req.params.id], (err, data) => {
        if (err) return res.json(err)

        return res.render('add-data', { tables: data, act_id: req.params.id, currentPath: req.path })
    })

})



// create rows
router.post('/create-rowz/:id', VerifyToken, (req, res) => {

    const dataz = req.body.newarr


    const sql = 'INSERT INTO murukali.rowz VALUES(?)'
    const rowz = [
        null,
        req.body.dateInput ||date(),
        req.params.id
    ]

    db.query(sql, [rowz], (err, data) => {
        if (err) return res.json(err)


        const s_sql = 'SELECT * FROM murukali.rowz '

        db.query(s_sql, (err, decoded) => {
            if (err) return res.json(err)



            const q = 'INSERT INTO murukali.dataz VALUES ?'

            dataz.forEach(info => {

                info.push(decoded[decoded.length - 1].rowz_id)
            })
    



            db.query(q, [dataz], (err, dat) => {
                if (err) return res.json(err)

                res.json(dat)

            })

        })
    })


})



router.get('/update-data/:id', VerifyToken,  (req, res) => {
    const sql = `
       SELECT murukali.columnz.col_name, murukali.columnz.col_type, COALESCE(murukali.dataz.dataz_value, '') AS dataz_value, murukali.columnz.col_id, ? AS rows_id, murukali.tablez.act_id
       FROM murukali.columnz
       LEFT JOIN murukali.dataz ON murukali.columnz.col_id = murukali.dataz.col_id AND murukali.dataz.rows_id = ?
       LEFT JOIN murukali.tablez ON murukali.tablez.tablez_id = murukali.columnz.tablez_id WHERE murukali.tablez.tablez_id = (SELECT tables_id FROM murukali.rowz WHERE rowz_id = ?)
    `;

    db.query(sql, [req.params.id, req.params.id,req.params.id,req.params.id], (err, data) => {
        if (err) return res.json(err);

        if (data.length > 0) {
            const act_id = data[0].act_id; // Get the activity ID
            return res.render('update-data', { dataz: data, act_id: act_id, currentPath: req.path });
        } else {
            return res.render('update-data', { dataz: [], act_id: null, currentPath: req.path });
        }
    });
});



// delete data from table

router.delete('/delete-data/:id', VerifyToken, (req, res) => {
    const sql = 'DELETE FROM murukali.rowz WHERE rowz_id = ?'

    db.query(sql, [req.params.id], (err, data) => {
        if (err) return res.json(err)
        return res.json(data)
    })
})



// PUT request to update data
router.put('/update-data/:id', VerifyToken, (req, res) => {
    const rowId = req.params.id;
    const dataToUpdate = req.body; // This should be an array of [columnId, rowId, value]

    // Function to check if data exists and insert if missing
    const checkAndInsertData = (colId, rowId, callback) => {
        // Check if data exists
        const checkSql = `SELECT 1 FROM murukali.dataz WHERE col_id = ? AND rows_id = ? LIMIT 1`;
        db.query(checkSql, [colId, rowId], (err, results) => {
            if (err) return callback(err);

            if (results.length === 0) {
                // Data does not exist, so insert it
                const insertSql = `INSERT INTO murukali.dataz (col_id, rows_id, dataz_value) VALUES (?, ?, ?)`;
                db.query(insertSql, [colId, rowId, ''], (err) => {
                    callback(err);
                });
            } else {
                callback();
            }
        });
    };

    // Process each item: check and insert if necessary, then update
    let remaining = dataToUpdate.length;
    
    dataToUpdate.forEach(([colId, rowId, value]) => {
        checkAndInsertData(colId, rowId, (err) => {
            if (err) return res.status(500).json({ message: 'Data insertion failed', error: err });

            // Update the data
            const updateSql = `UPDATE murukali.dataz SET dataz_value = ? WHERE col_id = ? AND rows_id = ?`;
            db.query(updateSql, [value, colId, rowId], (err) => {
                if (err) return res.status(500).json({ message: 'Data update failed', error: err });

                remaining -= 1;
                if (remaining === 0) {
                    res.json({ message: 'Data updated successfully' });
                }
            });
        });
    });
});

router.delete('/delete-column/:id', VerifyToken,  (req, res) => {
    const sql = 'DELETE FROM murukali.columnz WHERE col_id = ?'

    db.query(sql, [req.params.id], (err, data) => {
        if (err) return res.json(err)
        return res.json(data)
    })
})

router.put('/delete-date/:id',VerifyToken, (req,res)=>{
    const sql = 'UPDATE murukali.tablez SET isDate = ? WHERE tablez_id = ?'
    db.query(sql, [false,req.params.id], (err, data) => {
        if (err) return res.json(err)
        return res.json(data)
    })
})
router.put('/delete-day/:id',VerifyToken, (req,res)=>{
    const sql = 'UPDATE murukali.tablez SET isDay = ? WHERE tablez_id = ?'
    db.query(sql, [false,req.params.id], (err, data) => {
        if (err) return res.json(err)
        return res.json(data)
    })
})





module.exports = router