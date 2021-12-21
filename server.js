var express = require('express');
var app = express();  
const propertyRoutes=require('./src/routes/property.routes');   
const bodyParser = require('body-parser');
const con=require('./config/db.config');

app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json())

app.use('/api',propertyRoutes);


var server = app.listen(8000, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("welcome to the property Management Api system");   
   console.log("Example app listening at http://%s:%s", host, port)
})


