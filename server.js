var express = require('express');
var app = express();
const mysql=require('mysql');
const propertyRoutes=require('./routes/property.route'); 

const con=mysql.createConnection({  
  host: "localhost",
  user: "root",
  password: "",
  database: "property"
}); 

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


app.use('/api',propertyRoutes);




var server = app.listen(8000, function () { 
   var host = server.address().address
   var port = server.address().port

   console.log("welcome to the property Management Api system");   
   console.log("Example app listening at http://%s:%s", host, port)
})


