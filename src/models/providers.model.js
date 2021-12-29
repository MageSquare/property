'use strict';
const dbConn = require('../../config/db.config'),
	  bcrypt = require('bcrypt'),
	  salt = 10,
	  jwt = require('jsonwebtoken');

require('dotenv').config();

var Providers = function(providers){

this.firstname			=  providers.firstname;
this.password 			=  providers.password;
this.email 				=  providers.email;
this.lastname 			=  providers.lastname;
this.fullname 			=  providers.fullname;
this.phone 				=  providers.phone;
this.firma 				=  providers.firma;
this.provider_dir 		=  providers.provider_dir;
this.state 				=  providers.state;
this.city 				=  providers.city;
this.pic 				=  providers.pic;
this.role 				=  providers.role;
this.created_at 		=  new Date();
this.updated_at 		=  new Date();

}

// Register
	Providers.register = function(providers,result){

		let mailId=JSON.stringify(providers.email),
			username=JSON.stringify(providers.fullname),
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
	        				error['message']=err;
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

module.exports = Providers;