const express = require('express');
const router = express.Router();
const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const DB_NAME = 'rtarf04';
const TB_NAME = 'user'
var mongo_db_url = "mongodb://" + DB_NAME + ":" + DB_NAME + "@122.155.202.161:27017/" + DB_NAME + "?authSource=" + DB_NAME;

let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {3AVVYZEeak2jsVelEUG/1CGGJd1fLUfnE0DErZVkZhXVSp3YbP3mhLU1NnkO8GkU0tDsNbRL0MoUFzIJYaQ0dY9oh6Ytj5H0aagj6jS5vL02rjhRJnnMw4xivHo9sGS2BF6UpRfZ5JhxGLxRufOE+QdB04t89/1O/w1cDnyilFU=}'
}

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

router.get('/', (req, res) => {
    res.send({
        status: 'ok'
    });
});

router.get('/get-uid-by-user', (req, res) => {
    const id = req.query.id;
    connectMongoDBNoToken(res, async db => {
        let dbo = db.db(DB_NAME);
        const collection = dbo.collection(TB_NAME);
        let query = {
            "_id": ObjectID(id),
        }

        let item = await collection.findOne(query);
        db.close();
        res.send({
            item
        });
    });
});

router.post('/update-uid', (req, res) => {
    let id = req.body.id;
    let uid = req.body.uid;

    connectMongoDBNoToken(res, async db => {
        let dbo = db.db(DB_NAME);
        const collection = dbo.collection(TB_NAME);

        let query = {
            "_id": ObjectID(id),
        }

        let updateCommand = {
            $set: {
                "line_uid": uid
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

router.post('/', (req, res) => {
    let reply_token = req.body.events[0].replyToken
    let msg = req.body.events[0].source.userId
    reply(reply_token, msg);
    res.sendStatus(200);
});

function reply(reply_token, msg) {
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: msg
        }]
    })

    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}

router.post('/send-message', (req, res) => {
    const uid = req.body.uid;
    const msg = req.body.msg;
    uid.forEach(element => {
        sendMessage(element, msg);
    });
    res.send({
        status: true
    });
});

async function sendMessage(uid, msg) {
    let body = JSON.stringify({
        to: uid,
        messages: [{
            type: 'text',
            text: msg
        }]
    })

    await request.post({
        url: 'https://api.line.me/v2/bot/message/push',
        headers: headers,
        body: body
    }, (err, res, body) => {
        // console.log('status = ' + res.statusCode);
    });
}

module.exports = router;