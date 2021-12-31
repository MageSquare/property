'use strict';
const dbConn = require('../../config/db.config'),
	  bcrypt = require('bcrypt'),
	  jwt = require('jsonwebtoken');
require('dotenv').config();

var Providers = function(providers){
	this.id 					= providers.id
	this.firstname				= providers.firstname;
	this.password				= providers.password;
	this.email					= providers.email;
	this.lastname				= providers.lastname;
	this.fullname				= providers.fullname;
	this.phone					= providers.phone;
	this.firma					= providers.firma;
	this.provider_dir			= providers.provider_dir;
	this.state					= providers.state;
	this.city					= providers.city;
	this.pic					= providers.pic;
	this.role					= providers.role;
	this.created_at				= new Date();
	this.updated_at				= new Date();
}

// get current user
	Providers.getUser = function(id,result){
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


// Login
	Providers.login = function(email,password,result){
		var sql = "SELECT * FROM providers where email = '"+email+"'";
		let round = Number(process.env.SALT);
		const salt = bcrypt.genSaltSync(round);
		const hash = bcrypt.hashSync(password, salt);
		dbConn.query(sql, function (err, user) {
	        if (err) {
	        	let error = new Object();
	        	error['message']='Sorry You are not valid User!';
	            result(error, null);
	        } else {
	        	if(!user || user === null || user.length === 0){
	        		let error = new Object();
		        	error['message']='Sorry You are not registered here!';
		            result(error, null);
	        	}else{
	        		 if(!bcrypt.compareSync(password, user[0].password)) {
	        		 	let error = new Object();
			        	error['message']='Wrong password!';
			            result(error, null);
	        		 }else{
	        			var userId = user[0].id;
			    		const token = jwt.sign({userId: userId},process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIREIN }); 
			    		let info = new Object();
			    		info['accessToken'] = token;
	        			result(null,info);
	        		 }
	        	}
	        }
	    });
	};
// Login

module.exports = Providers;