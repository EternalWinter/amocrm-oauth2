const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', function (req, res) {

        // place your code logic here
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('thanks');
});

app.listen(80, '127.0.0.1');


