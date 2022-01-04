'use strict';
const dbConn = require('../../config/db.config');

var ImmobilieEvaluate = function(immobilieevaluate){

	this.id							=immobilieevaluate.id;
	this.openimmo_obid				=immobilieevaluate.openimmo_obid;
	this.objektkategorie			=immobilieevaluate.objektkategorie;
	this.geo						=immobilieevaluate.geo;
	this.kontaktperson				=immobilieevaluate.kontaktperson;
	this.weitere_adresse			=immobilieevaluate.weitere_adresse;
	this.preise						=immobilieevaluate.preise;
	this.bieterverfahren			=immobilieevaluate.bieterverfahren;
	this.versteigerung				=immobilieevaluate.versteigerung;
	this.flaechen					=immobilieevaluate.flaechen;
	this.ausstattung				=immobilieevaluate.ausstattung;
	this.zustand_angaben			=immobilieevaluate.zustand_angaben;
	this.bewertung					=immobilieevaluate.bewertung;
	this.infrastruktur				=immobilieevaluate.infrastruktur;
	this.freitexte					=immobilieevaluate.freitexte;
	this.anhaenge					=immobilieevaluate.anhaenge;
	this.verwaltung_objekt			=immobilieevaluate.verwaltung_objekt;
	this.verwaltung_techn			=immobilieevaluate.verwaltung_techn;
	this.user_defined_simplefield	=immobilieevaluate.user_defined_simplefield;
	this.user_defined_anyfield		=immobilieevaluate.user_defined_anyfield;
	this.user_defined_extend		=immobilieevaluate.user_defined_extend;
	this.update_time				=immobilieevaluate.update_time;
	this.top_directory				=immobilieevaluate.top_directory;
	this.directory					=immobilieevaluate.directory;
	this.created_at					=new Date();
	this.updated_at					=new Date();
	this.deleted_at					=new Date();

}

// Get Evaluation by userid
    ImmobilieEvaluate.getmycreatedEvaluation = function(userid,per_page,curr_page,result){
    	var sql_query = "select provider_dir from providers where id = "+userid+"";
    	dbConn.query(sql_query,function(err,data){
    		if(err){
    			let error = new Object();
    			error['message'] = error;
    			result(error, null);
    		}
    		else{
    			for (var i = 0; i < data.length; i++) {
    					let pid = data[i].provider_dir;
			            var sql_query = "select * from immobilie_evaluates where top_directory = "+pid+"";
			            let offset = (curr_page-1)*per_page;
				        var sql =sql_query+' limit '+ per_page +' offset '+ offset +' ';
			            dbConn.query(sql,function(err,data){
			            	if(err){
			            		let error = new Object();
				    			error['message'] = error;
				    			result(error, null);
			            	}
			            	else{
			            		 result(null, data);
			            	}
			            });
     			}
    		}

    	});
    }
// Get Evaluation by userid

// Delete created evalution
    ImmobilieEvaluate.deleteCreatedEvalution = function(id,result){
 	
 		var sql = "select * from immobilie_evaluates where id = "+id+"";

 		dbConn.query(sql,function(err,data){
 			if(err){
 				let error=new Object();
 				error['message']=err;
 				result(error,null);
 			}
 			else{
 				let immob_evl_id;
 				for (var i = 0; i < data.length; i++) {
 					let id = data[i].id;
 					immob_evl_id=id;
 				}
 				var sql = "delete from immobilie_evaluates where id="+ immob_evl_id +" ";
 				dbConn.query(sql,function(err,data){
 					if(err){
 						let error=new Object();
		 				error['message']='Can not delete the record, from immobilie_evaluates! May the record does not exisiting';
		 				result(error,null);
 					}
 					else{
 						result(null,'Record has deleted for id: '+ id);
 					}
 				})
 			}
 		});


    	
    }
// Delete created evalution

module.exports = ImmobilieEvaluate;