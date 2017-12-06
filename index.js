var express = require("express");
var session = require('express-session'); 
var morgan = require("morgan");
var app = express();

app.use(session({secret: '!@ASD$%^123&#*', resave: false, saveUninitialized: true}));
app.use(express.static("angular"));
app.use(morgan("dev"));
require("./controller/routes")(app);
require("./controller/mailController")(app);
require("./controller/iamController")(app);

var server = app.listen(80, function(){
console.log("server started at http://127.0.0.1:80");
});
