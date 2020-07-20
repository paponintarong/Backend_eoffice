const Express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = new Express();

app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-access-token');
    next();
});

const common = require('./routes/common');
app.use('/', common);

const port = 3000;
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});