const express = require('express');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv').config({
    path: path.join(__dirname, '.env')
});
const debug = require('debug')('app');

const mysql = require('mysql');
const DbConnector = require('./model/mysqlConnector.js');

global.db_config = new DbConnector(mysql, 'config');
global.db_sketch_plans = new DbConnector(mysql, 'sketch_plans');

const app = express();

app.use(session({
    secret: "1F#3Ci>3bS`EdwbxD+pn",
    saveUninitialized: true,
    resave: false
}));

app.use(cors());
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/build')));

const routes = require('./routes/route.js');

app.get('/source/:fileType/:name', function (req, res) {
    
	let Path = path.join(__dirname, '.', '/public/upload/' + req.params.fileType + '/' + req.params.name + '.' + req.params.fileType);
    res.sendFile(Path);
});

app.use('/', routes);

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

let port = process.env.PORT || 7001;
app.listen(port);

debug("running port # " + port);
debug("#.env", process.env.NODE_ENV);