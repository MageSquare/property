'use strict';
const dbConn = require('../../config/db.config');
var bcrypt = require('bcrypt');
var salt = 10;

var Profiles = function(profiles){
	this.user_id				= profiles.user_id;
	this.provider_id			= profiles.provider_id;
	this.vorname				= profiles.vorname;
	this.lastname				= profiles.lastname;
	this.firma					= profiles.firma;
	this.email					= profiles.email;
	this.phone					= profiles.phone;
	this.state					= profiles.state;
	this.city					= profiles.city;
	this.image					= profiles.image;
	this.benachrichtigungen		= profiles.benachrichtigungen;
	this.mitteilungen			= profiles.mitteilungen;
	this.deleted_at				= new Date();
	this.created_at				= new Date();
	this.updated_at				= new Date();
	this.provider_dir			= profiles.provider_dir;
	this.url					= profiles.url;
	this.propertyAccessible		= profiles.propertyAccessible;
	this.immoKontakt			= profiles.immoKontakt;
}


// Get Properties by login user
	// Profiles.userProperties = function(currentUser,per_page,curr_page,result){
	//     var sql = "select * from profiles p where user_id = "+currentUser+" and p.deleted_at is null"
	//     dbConn.query(sql,function(err,data){
	//         if(err){
	//         	result(null,err);
	//         }
	//         else{
	// 	        let pid;
	//             for (var i = 0; i < data.length; i++) {
	//                 let provider_id = data[i].provider_id;
	// 	            if(provider_id){ 
	// 	                if(provider_id < 10){
	// 	                    pid=('0000'+provider_id);
	// 	                }
	// 	                else if(provider_id < 100){
	// 	                    pid=('000'+provider_id);   
	// 	                }
	// 	                else if(provider_id < 1000){
	// 	                    pid=('00'+provider_id);   
	// 	                }
	// 	                else if(provider_id < 10000){
	// 	                    pid=('0'+provider_id);   
	// 	                }
	// 	            }
	//             }
	//                 var sql="select * from immobilies i where json_unquote(json_extract(`verwaltung_techn`, '$.aktion.aktionart')) = 'CHANGE' and top_directory = "+pid+" limit "+per_page+" offset "+curr_page+"";
	                
	//                 dbConn.query(sql, function (err, data) {
	//                 if (err) {
	//                 	result(null,err);
	//                 } else {
	//                 	result(null,data);
	//                 }
	//             });
	//         }
	//     });
	// }
// Get Properties by login user

// Register
	// Profiles.register = function(firstname,lastname,email,password,result){
		
	// 	let name = firstname.concat(' ', lastname);
	// 	let mailId=JSON.stringify(email);
	// 	let username=JSON.stringify(name);
	// 	let userpassword=JSON.stringify(bcrypt.hashSync(password,salt));
	// 	let userfirstname=JSON.stringify(firstname);
	// 	let userlastname=JSON.stringify(lastname);

	//     var sql = "select * from profiles p where p.email = "+mailId+" and p.deleted_at is null";

	//     dbConn.query(sql, function (err, res) {
	//         if (err) {
	//         	let error = new Object();
	//         	error['message']='Something went wrong!!'
	//             result(error, null);
	//         } else {
	//         	let new_user;
	//         	if(res==[] || res==null || res==''){
	// 		       	new_user = true;
	//         		var sql = "Insert into Users (name,password,email,role) VALUES("+username+","+userpassword+","+mailId+",'admin')";
	//         		dbConn.query(sql, function(err,res){

	//         			if(err){
	//         				let error = new Object();
	//         				error['message']='Something went wrong!!!'
	//             			result(error, null);
	//         			}
	//         			else{
	//         			    var sql = "Insert into Profiles (vorname,lastname,email) VALUES("+userfirstname+","+userlastname+","+mailId+")";
	//         			    dbConn.query(sql,function(err,data){
	//         			    	if(err){
	//         			    		let error = new Object();
	//         						error['message']='Something went wrong!!!'
	//             					result(error, null);
	//         			    	}
	//         			    	else{
	// 		        				result(null, new_user);
	//         			    	}
	//         			    });
	//         			}
	//         		});
	//         	}
	//         	else{
	//         		new_user = false;
	//         		result(null, new_user);
	//         	}
	//         }
	//     });
	// }
// Register

module.exports = Profiles;