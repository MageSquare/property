'use strict';
const dbConn = require('../../config/db.config');
var nodemailer = require("nodemailer");
var jwt = require('jsonwebtoken');

//Set Mail Access
	var transporter = nodemailer.createTransport({
	    port: 465,               // true for 465, false for other ports
	    host: "smtp.gmail.com",  
	    auth: {
	        user: 'development.crayon@gmail.com',
	        pass: 'development@crayon22115258',
	    },
	    secure: true,
	});
//Set Mail Access

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

// Forget Password API
	Users.forgetPassword = function(origin_server,url,receiver_email,secret_key,result){
		console.log('origin_server',origin_server);
		let rec_mail=receiver_email;
		let mailId=JSON.stringify(receiver_email);
	    var sql = "select * from users u where email = "+mailId+" and deleted_at is null";

	    dbConn.query(sql,function(err,res){

		     if(err){
		     	let error = new Object();
	        	error['message']='Something went wrong!!!'
	            result(error, null);
		     }
		     else{

		     	console.log('45',res);

		     	if(res!=null || res !='' || res!=[]){
		     		let receiver_name;
		     		let rec_id;

		   			for (var i = 0; i < res.length; i++) {
		   				let name = res[i].name;
		   				receiver_name=name;
		   				let id = res[i].id;
		   				rec_id = id;
		   			}

		   			var origin= origin_server;
		   			let baseUrl=url;
		   			console.log('57',baseUrl);
		   			// var resetLink = 'auth/reset-password';
					const token = jwt.sign({id: [rec_id,new Date()]}, secret_key, { expiresIn: 60*5 });
					console.log(origin);
					console.log(baseUrl);
					console.log(token);
		   			var resetUrl =  origin+'/'+baseUrl+'/'+token;
					console.log('url',resetUrl);

		   			let mail_send = mailSending(resetUrl,rec_id,rec_mail,receiver_name);
					let mail_flag;

		   			if(mail_send){
		   				mail_flag = true;
		   				result(null,mail_flag);
		   			}
		   			else{
		   				mail_flag = false;
		   				result(null,mail_flag);
		   			}
		     	}
		     	else{

		     		let error = new Object();
	        		error['message']='The email is not existing in our application!';
	            	result(error, null);
		     	}
		     }
	    });

	}
// Forget Password API

// Reset Password
	Users.resetPassword = function(id,new_pswd,result){
		console.log(id);
		let uid=id;
		let new_password = new_pswd;

	    var sql = "select * from users u where id = "+uid+" and u.deleted_at is null";

	    dbConn.query(sql,function(err,res){

		     if(err){
		     	let error = new Object();
	        	error['message']='Something went wrong!!!'
	            result(error, null);
		     }
		     else{

		     	console.log('45',res);
		     	if(res!=null || res !='' || res!=[]){

		     		var sql = "update users SET password ="+new_password+" where id="+uid+" ";

		     		dbConn.query(sql, function(err,res){
		     			if(err){

		     				let error = new Object();
	        				error['message']='Sorry! Can not set new password.'
	           				result(error, null);
		     			}
		     			else{

		     				console.log('110',res);
		     			}
		     		});
		     	}
		     	else{

		     		let error = new Object();
	        		error['message']='The email is not existing in our application!';
	            	result(error, null);
		     	}
		     	
		     }
	    });

	}
// Reset Password

							// #################### Functions ######################


// Send mail to USer For forgot passwor
   async function mailSending(resetUrl,rec_id,receiver_email,receiver_name) {
   			console.log(rec_id);
   			let rc_mail = receiver_email;
			return new Promise((resolve,reject)=>{
				// Set data for customer
		      var receiver_email = {
		          to:rc_mail,
		          subject: "You are about to reset your password.",
		          sender: "admin",
		          html:'<h2>You can change your password</h2>',
		          // msg_content = "Please reset your password <a href='".env('Builder_URL', resetUrl)."/?id=".rec_id."'>here</a>.";
		      };
		      // send mail to user
		      transporter.sendMail(receiver_email, function (error, response) {
		          if (error) {

		            console.log("emailadmin",error);
	                return 0;

		          } else {

		          	resolve(1);

	          	  }
		      });
	    });
   }
	// Send mail to USer For forgot passwor

module.exports = Users;