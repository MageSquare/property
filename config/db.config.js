'use strict';

const mysql=require('mysql');
const dbConn=mysql.createConnection({  
  host: "localhost",  
  user: "root",
  password: "",
  database: "property"
});
   

dbConn.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});       

module.exports = dbConn;                
