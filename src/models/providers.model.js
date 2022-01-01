'use strict';
const dbConn = require('../../config/db.config'),
	  bcrypt = require('bcrypt'),
	  jwt = require('jsonwebtoken'),
	  nodemailer = require("nodemailer");

require('dotenv').config();

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

// Register
	Providers.register = function(providers,result){
		let mailId=JSON.stringify(providers.email),
			username=JSON.stringify(providers.fullname),
			round = Number(process.env.SALT),
			salt = bcrypt.genSaltSync(round),
			userpassword=JSON.stringify(bcrypt.hashSync(providers.password,salt)),
			userfirstname=JSON.stringify(providers.firstname),
			userlastname=JSON.stringify(providers.lastname),
			phone = JSON.stringify(providers.phone),
			firma = JSON.stringify(providers.firma),
			state = JSON.stringify(providers.state),
			city = JSON.stringify(providers.city),
			pic = JSON.stringify(providers.pic),
			role = JSON.stringify(providers.role),
			created_at = JSON.stringify(new Date()),
			updated_at = JSON.stringify(new Date()),
			provider_dir = providers.provider_dir;

	    var sql = "select * from providers p where p.email = "+mailId+" ";

	    dbConn.query(sql, function (err, res) {
	        if (err) {
	        	let error = new Object();
	        	error['message']='Data Not Found!';
	            result(error, null);
	        } else {
	        	if(res==[] || res==null || res==''){

	        		var sql = "Insert into providers (firstname,password,email,lastname,fullname,phone,firma,provider_dir,state,city,pic,role,created_at,updated_at) VALUES("+userfirstname+","+userpassword+","+mailId+","+userlastname+","+username+","+phone+","+firma+","+provider_dir+","+state+","+city+","+pic+","+role+","+created_at+","+updated_at+")";
	        		dbConn.query(sql, function(err,res){
	        			if(err){
	        				let error = new Object();
	        				error['message']='Something went wrong!';
	            			result(error, null);
	        			}
	        			else{
	        				var userId = res.insertId;
	        				let provider_dirId;

	        				if (userId < 10){
	        					provider_dirId=('0000'+userId);
	        				}
	        				else if(userId < 100){
	        					provider_dirId=('000'+userId);
	        				}
	        				else if(userId < 1000){
	        					provider_dirId=('00'+userId);
	        				}
	        				else if(userId < 10000){
	        					provider_dirId=('0'+userId);
	        				}

	        				let pid = JSON.stringify(provider_dirId);

	        			    var sql = "Update providers set provider_dir ="+pid+"  where id="+userId+"";
	        			    dbConn.query(sql,function(err,data){

	        			    	if(err){
	        			    		let error = new Object();
	        						error['message']='Something went wrong!, Can Not Update Provider_dir';
	            					result(error, null);
	        			    	}
	        			    	else{
	        			    		const token = jwt.sign({userId: userId},process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIREIN });
	        			    		let info = new Object();
	        			    		info['accessToken'] = token;
			        				result(null, info);
	        			    	}
	        			    });
	        			}
	        		});
	        	}
	        	else{
	        		let error = new Object();
					error['message']='Upps! you are already register.'
					result(error, null);
	        	}
	        }
	    });
	}
// Register

// Forget Password API
	Providers.forgetPassword = function(origin_server,url,receiver_email,result){

		let rec_mail=receiver_email;
		let mailId=JSON.stringify(receiver_email);
	    var sql = "select * from providers p where p.email = "+mailId+" ";

	    dbConn.query(sql,function(err,res){

		     if(err){
		     	let error = new Object();
	        	error['message']='Sorry! your account is not existing in our application.';
	            result(error, null);
		     }
		     else{
			     	if(res.length>0){

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
						const token = jwt.sign({id: [rec_id,new Date()]}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIREIN });
			   			var resetUrl = 'http://'+origin+baseUrl+'/reset_password?token='+token;

			   			let mail_send = mailSending(resetUrl,rec_id,rec_mail,receiver_name);
			   			
			   			if(mail_send){
			   				result(null,"Email has been send");
			   			}
			   			else{
			   				result(null,"Sorry! Not Able To Send Email.");
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
	Providers.resetPassword = function(id,new_pswd,result){

		let uid=id;
		let round = Number(process.env.SALT);
		const salt = bcrypt.genSaltSync(round);
		let new_password = JSON.stringify(bcrypt.hashSync(new_pswd,salt));
	    var sql = "select * from providers u where id = "+uid+" ";
	    dbConn.query(sql,function(err,res){

		     if(err){
		     	let error = new Object();
	        	error['message']="Oops! Something Went Wrong.";
	            result(error, null);
		     }
		     else{
		     	if(res.length>0){
		     		var sql = "update providers SET password ="+new_password+" where id="+uid+" ";
		     		dbConn.query(sql, function(err,res){
		     			if(err){
		     				let error = new Object();
	        				error['message']='Not Able To Update Password';
	           				result(error, null);
		     			}
		     			else{
		     				result(null, res);
		     			}
		     		});
		     	}
		     	else{
		     		let error = new Object();
	        		error['message']='The email Id is not existing in our application!';
	            	result(error, null);
		     	}
		     	
		     }
	    });

	}
// Reset Password

							// #################### Functions ######################


// Send mail to USer For forgot password
   async function mailSending(resetUrl,rec_id,receiver_email,receiver_name) {
   			let rc_mail = receiver_email;
   			let url = JSON.stringify(resetUrl);

			return new Promise((resolve,reject)=>{
				// Set data for customer
		      var receiver_email = {
		          to:rc_mail,
		          subject: "You are about to reset your password.",
		          sender: "admin",
		          html:'<p>Click <a href= ' + url + '>here</a> to reset your password</p>'
		      };
			      // send mail to user
			      transporter.sendMail(receiver_email, function (error, response) {
			          if (error) {
		                return 0;
			          } else {
			          	resolve(1);
		          	  }
			      });
	    });
   }
// Send mail to USer For forgot password

module.exports = Providers;