const express=require('express');
const app=express();
const propertyRoutes = express.Router();
const mysql=require('mysql');
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
// Get one properties by id

propertyRoutes.route('/property/(:id)').get(function (req, res){
	let id = req.params.id;
	console.log(id);
	con.query('select * from immobilies where openimmo_obid like?','%'+ id + '%',(err,rows)=>{

	  if(err){
         res.send(err);
      }
      else
      {
         res.send(rows);  
      }
	});
	// con.query('SELECT * from immobilies where openimmo_obid LIKE '%id%' and immobilies.deleted_at is null order by created_at desc limit 1',(err,rows)=>{
	  
	// });
});

module.exports = propertyRoutes;
