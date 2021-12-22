'use strict';
const dbConn = require('../../config/db.config');
//Profile object created

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

// 

Profiles.userProperties = function(currentUser,per_page,curr_page,result){
	console.log(currentUser);
    var sql = "select * from profiles p where user_id = "+currentUser+" and p.deleted_at is null"
    dbConn.query(sql,function(err,data){
        if(err){
        	result(null,err);
        }
        else{
	        let pid;
            for (var i = 0; i < data.length; i++) {
                let provider_id = data[i].provider_id;
	            if(provider_id){ 
	                if(provider_id < 10){
	                    pid=('0000'+provider_id);
	                }
	                else if(provider_id < 100){
	                    pid=('000'+provider_id);   
	                }
	                else if(provider_id < 1000){
	                    pid=('00'+provider_id);   
	                }
	                else if(provider_id < 10000){
	                    pid=('0'+provider_id);   
	                }
	            }
            }
                var sql="select * from immobilies i where json_unquote(json_extract(`verwaltung_techn`, '$.aktion.aktionart')) = 'CHANGE' and top_directory = "+pid+" limit "+per_page+" offset "+curr_page+"";
                
                dbConn.query(sql, function (err, data) {
                if (err) {
                	result(null,err);
                } else {
                	console.log(data);
                	result(null,data);
                }
            });
        }
    });
}

module.exports = Profiles;