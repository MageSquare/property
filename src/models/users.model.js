'use strict';
const dbConn = require('../../config/db.config');

var Users = function(users){
	this.name					= users.name;
	this.email					= users.email;
	this.email_verified_at		= new Date();
	this.password				= users.password;
	this.role					= users.role;
	this.remember_token			= '';
	this.created_at				= new Date();
	this.updated_at				= new Date();
	this.deleted_at				= new Date();
}

// get current user
	Users.getUser = function(id,result){
		var sql = "SELECT * FROM providers where id = "+id;
		 dbConn.query(sql, function (err, res) {
	        if (err) {
	        	let error = new Object();
	        	error['message']='Data Not Found!';
	            result(error, null);
	        } else {
	        	result(null,res[0]);
	        }
	    });
	};
// get current user

module.exports = Users;