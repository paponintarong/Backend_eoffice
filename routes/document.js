const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const DB_NAME = 'rtarf04';
const TB_NAME = 'document'
var mongo_db_url = "mongodb://" + DB_NAME + ":" + DB_NAME + "@122.155.202.161:27017/" + DB_NAME + "?authSource=" + DB_NAME;

function connectMongoDBNoToken(res, callback) {
    MongoClient.connect(
        mongo_db_url, {
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

router.post('/add-file', (req, res) => {
    let formData = req.body.formData;
    formData.createAt = new Date();

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
            dbo.collection(TB_NAME).insertOne(formData, function (err, result) {
                if (err) {
                    res.send({
                        status: false
                    });
                } else {
                    res.send({
                        status: true,
                        result
                    });
                }
            });
            db.close();
        }
    );
});
router.post('/update', (req, res) => {
    let formData = req.body.formData;
    let id = req.body.id;

    connectMongoDBNoToken(res, async db => {
        let dbo = db.db(DB_NAME);
        const collection = dbo.collection(TB_NAME);

        let query = {
            "_id": ObjectID(id),
        }

        let updateCommand = {
            $set: {
                "users_action": formData.user_list
            }
        }

        let result = await collection.updateOne(query, updateCommand);

        db.close();
        if (result) {
            res.send({
                status: true,
                result
            });
        } else {
            res.send({
                status: false
            });
        }
    });
});
router.get('/get-by-owner', (req, res) => {
    const id = req.query.id;
    connectMongoDBNoToken(res, async db => {
        let dbo = db.db(DB_NAME);
        const collection = dbo.collection(TB_NAME);
        let query = {
            "owner._id": id,
        }

        let dataList = await collection.find(query).toArray();
        db.close();
        res.send({
            dataList
        });
    });
});
router.get('/get-by-user', (req, res) => {
    const id = req.query.id;
    connectMongoDBNoToken(res, async db => {
        let dbo = db.db(DB_NAME);
        const collection = dbo.collection(TB_NAME);
        let unwind = {
            $unwind: "$users_action"
        };
        let query = {
            $match: {
                "users_action._id": id,
            }
        }

        // let dataList = await collection.find(query).toArray();
        let dataList = await collection.aggregate([unwind, query]).toArray();
        db.close();
        res.send({
            dataList
        });
    });
});

router.post('/update-action', (req, res) => {
    let docId = req.body.docId;
    let userId = req.body.userId;
    let status = req.body.status;

    connectMongoDBNoToken(res, async db => {
        let dbo = db.db(DB_NAME);
        const collection = dbo.collection(TB_NAME);

        let query = {
            "_id": ObjectID(docId),
            "users_action._id": userId,
        }

        let updateCommand = {
            $set: {
                "users_action.$.status": status,
                "users_action.$.action_date": new Date(),
            }
        }

        let result = await collection.updateOne(query, updateCommand);

        db.close();
        if (result) {
            res.send({
                status: true,
                result
            });
        } else {
            res.send({
                status: false
            });
        }
    });
});
router.get('/get-count-waiting-by-user', (req, res) => {
    const id = req.query.id;
    connectMongoDBNoToken(res, async db => {
        let dbo = db.db(DB_NAME);
        const collection = dbo.collection(TB_NAME);
        let query = {
            $match: {
                "users_action._id": id,
                "users_action.status": null,
            }
        }
        let count = {
            $count: "users_action"
        }

        let dataList = await collection.aggregate([query, count]).next();
        db.close();
        res.send({
            dataList
        });
    });
});
module.exports = router;