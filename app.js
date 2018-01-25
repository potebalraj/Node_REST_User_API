var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();

var db = mongoose.connect('mongodb://localhost/userAPI12');

var User = require('./models/userModel');
var config = require('./config');

var port = process.env.port || 3000;

app.set('supersecret', config.secret);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

userRouter = require('./Routes/userRoutes')(User);

app.use('/MyNode/api',userRouter);

app.get('/MyNode/', function (req, res) {
    res.send('Welcome to my user API');
});

app.listen(port,function(){
    console.log('Gulp is running my app on port ' + port);
});