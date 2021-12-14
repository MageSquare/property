var express = require('express');
var app = express();
const mysql = require('mysql');
router = express.Router();
propertyRoute = require('./routes/property.route');
app.use('/api', propertyRoute);


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'property'
  });
  connection.connect((err) => {
    if (err){
        res.status(503).send("there were something went wrong");
    }
    console.log('Connected to MySQL Server!');
  });

const port = process.env.PORT || 8000;

const server = app.listen(port, function(){
  console.log('Listening on port ' + port);
});

