const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

// เพิ่ม code
const MongoClient = require('mongodb').MongoClient;
// ให้เปลี่ยน rtarf02-05 ตามจำนวนเครื่อง
var mongo_db_url = "mongodb://rtarf04:rtarf04@122.155.202.161:27017/rtarf04?authSource=rtarf04";
// จบ  code
const ObjectID = require('mongodb').ObjectID;

const DIR = './uploads';
const DB_NAME = 'rtarf04';
const TB_NAME = 'files'

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

router.get('/user-all', (req, res) => {
    connectMongoDBNoToken(res, async db => {
        let dbo = db.db(DB_NAME);
        const collection = dbo.collection('user');
        let query = {
        }


        let dataList = await collection.find(query).toArray();
        db.close();
        res.send({ dataList });
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
            let dbo = db.db(DB_NAME);
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
            let dbo = db.db(DB_NAME);
            let item = await dbo.collection('user').findOne(query);
            db.close();
            res.send({
                item
            });
        }
    );
});
// จบเพิ่ม code

function connectMongoDBNoToken(res, callback) {
    MongoClient.connect(
        mongo_db_url,
        {
            useNewUrlParser: true
        },
        function (err, db) {
            if (err) {
                res.sendStatus(404);
                return;
            }
            callback(db);
        }
    );
}

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.originalname.replace(path.extname(file.originalname), '') +
            '_' +
            Date.now() +
            path.extname(file.originalname)
        );
    }
});

let upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 } // 10MB
});

router.get('/download/:fileId', (req, res) => {
    const fileId = req.params.fileId;

    connectMongoDBNoToken(res, db => {
        let dbo = db.db(DB_NAME);
        dbo.collection(TB_NAME).findOne(
            {
                _id: ObjectID(fileId)
            },
            function (err, data) {
                if (err) {
                    res.sendStatus(404);
                } else {
                    let splited = data.path.split('\\');
                    splited = data.path.split('/');
                    res.download(
                        path.join(__dirname, '..', splited[0], splited[1], splited[2]),
                        data.original_name
                    );
                }
            }
        );
    });
});

router.get('/preview/:fileId', (req, res) => {
    const fileId = req.params.fileId;

    connectMongoDBNoToken(res, db => {
        let dbo = db.db(DB_NAME);
        dbo.collection(TB_NAME).findOne(
            {
                _id: ObjectID(fileId)
            },
            function (err, data) {
                if (err) {
                    res.sendStatus(404);
                } else {
                    let splited = data.path.split('\\');
                    splited = data.path.split('/');
                    console.log(splited);
                    if (data.mime_type == "application/pdf") {
                        if (splited.length == 1) {
                            var tempFile = path.join(__dirname, '..', String(splited[0]));
                        } else {
                            var tempFile = path.join(__dirname, '..', String(splited[0]), String(splited[1]));
                        }

                        console.log(tempFile);
                        fs.readFile(tempFile, function (err, data) {
                            res.contentType("application/pdf");
                            res.send(data);
                        });
                    } else {
                        if (splited.length == 1) {
                            var tempFile = path.join(__dirname, '..', String(splited[0]));
                        } else {
                            var tempFile = path.join(__dirname, '..', String(splited[0]), String(splited[1]));
                        }
                        res.download(tempFile, data.original_name);
                    }
                }
            }
        );
    });
});

router.post('/uploadFile', upload.single('file'), function (req, res) {
    console.log("post");
    MongoClient.connect(
        mongo_db_url,
        {
            useNewUrlParser: true
        },
        function (err, db) {
            console.log(err);
            console.log(db);
            console.log(req.file);
            if (err) {
                res.sendStatus(404);
                return;
            }
            let dbo = db.db(DB_NAME);
            if (!req.file) {
                return res.send({
                    success: false
                });
            } else {
                console.log(req.file);
                let fileData = {
                    original_name: req.file.originalname,
                    file_name: req.file.filename,
                    path: req.file.path,
                    size_byte: req.file.size,
                    mime_type: req.file.mimetype,
                    createAt: new Date(),
                };
                dbo.collection(TB_NAME).insertOne(fileData, function (err, result) {
                    if (err) {
                        res.send({
                            success: false
                        });
                    } else {
                        res.send({
                            success: true,
                            result: result
                        });
                    }
                });
                db.close();
            }
        }
    );
});

module.exports = router;