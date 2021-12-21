const express = require('express'),
mysql = require('mysql'),
router = express.Router(),
bodyParser = require('body-parser'),
// var dbConn = require('./../../config/db.config'),
propertyRoutes= require('./routes/property.route'),
userRoutes=require('./routes/user.route'),

app =express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(cookieParser());


app.use('/api',propertyRoutes);
app.use('/api/user',userRoutes);

// var con =mysql.createConnection({
// 	 host: "localhost",
//   	 user: "root",
//   	 password: "",
//   	 database:'property'
// });

// con.connect(function(err){
// 	if(err) throw err;
// 	console.log("connected!");
// });

const port = process.env.PORT || 8000;

const server = app.listen(port, function(){
  console.log('Listening on port ' + port);
});

