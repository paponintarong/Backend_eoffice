const express = require('express');

const router = express.Router();

// เพิ่ม code
const MongoClient = require('mongodb').MongoClient;
// ให้เปลี่ยน rtarf02-05 ตามจำนวนเครื่อง
var mongo_db_url = "mongodb://rtarf04:rtarf04@122.155.202.161:27017/rtarf04?authSource=rtarf04";
// จบ  code

router.get('/', (req, res) => {
    res.send({
        status: 'ok'
    });
});

router.get('/a', (req, res) => {
    res.send({
        status: 'a'
    });
});

router.get('/user', (req, res) => {
    res.send({
        data: {
            id: 1,
            name: 'Weerayut'
        },
        data2: {
            rank: 'ร.อ.'
        }
    });
});

// เพิ่ม code
router.post('/register', (req, res) => {
    let formData = req.body.formData;

    MongoClient.connect(
        mongo_db_url, {
        useNewUrlParser: true
    },
        function (err, db) {
            if (err) {
                res.sendStatus(404);
                return;
            }
            // เปลี่ยนเป็น  rtarf01-04 ตามเครื่องนักเรียน
            let dbo = db.db('rtarf04');
            dbo.collection('user').insertOne(formData, function (err, result) {
                if (err) {
                    res.send({
                        status: false
                    });
                } else {
                    res.send({
                        status: true
                    });
                }
            });
            db.close();
        }
    );
});

// เพิ่ม code2
router.post('/login', (req, res) => {
    let formData = req.body.formData;

    MongoClient.connect(
        mongo_db_url, {
        useNewUrlParser: true
    },
        async function (err, db) {
            if (err) {
                res.sendStatus(404);
                return;
            }

            let query = {
                "rtarf_mail": formData.rtarf_mail,
                "password": formData.password
            }
            // เปลี่ยนเป็น  rtarf01-04 ตามเครื่องนักเรียน
            let dbo = db.db('rtarf04');
            let item = await dbo.collection('user').findOne(query);
            db.close();
            res.send({
                item
            });
        }
    );
});
// 

module.exports = router;