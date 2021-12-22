'use strict';
const dbConn = require('../../config/db.config');
const fs = require('fs');

var Immobilie = function(immobilie){
	this.openimmo_obid				= immobilie.openimmo_obid;
	this.objektkategorie			= immobilie.objektkategorie;
	this.geo						= immobilie.geo;
	this.kontaktperson				= immobilie.kontaktperson;
	this.weitere_adresse			= immobilie.weitere_adresse;
	this.preise						= immobilie.preise;
	this.bieterverfahren			= immobilie.bieterverfahren;
	this.versteigerung				= immobilie.versteigerung;
	this.flaechen					= immobilie.flaechen;
	this.ausstattung				= immobilie.ausstattung;
	this.zustand_angaben			= immobilie.zustand_angaben;
	this.bewertung					= immobilie.bewertung;
	this.infrastruktur				= immobilie.infrastruktur;
	this.freitexte					= immobilie.freitexte;
	this.anhaenge					= immobilie.anhaenge;
	this.verwaltung_objekt			= immobilie.verwaltung_objekt;
	this.verwaltung_techn			= immobilie.verwaltung_techn;
	this.user_defined_simplefield	= immobilie.user_defined_simplefield;
	this.user_defined_anyfield		= immobilie.user_defined_anyfield;
	this.user_defined_extend		= immobilie.user_defined_extend;
	this.update_time				= new Date();
	this.top_directory				= immobilie.top_directory;
	this.directory					= immobilie.directory;
	this.created_at					= new Date();
	this.updated_at					= new Date();
	this.deleted_at					= new Date();
}

// Fetch Property By Id
    Immobilie.fetchProperty = function(id,result){
    	var sql = 'select * from immobilies where id ='+id;
        dbConn.query(sql, function (err, res) {
            if (err) {
            	result(null, err);
            } else {
            	result(null, res);
            }
        });
    }
// Fetch Property By Id


// Get list of all properties by folder
    Immobilie.getProperties = function(pids,per_page,curr_page,result){
    	let pid;
        let providerids = [];
       	let prov_ids;
       	let p_id;

            for (var i = 0; i < pids.length; i++) {
                    pid=pids[i];
                    if(pid.provider_id < 10){
                        providerids.push('0000'+pid.provider_id);
                    }
                    else if(pid.provider_id < 100){
                        providerids.push('000'+pid.provider_id);   
                    }
                    else if(pid.provider_id < 1000){
                        providerids.push('00'+pid.provider_id);   
                    }
                    else if(pid.provider_id < 10000){
                        providerids.push('0'+pid.provider_id);   
                    }
                    prov_ids=providerids;
                    console.log(prov_ids);
            }
        	var sql ='select * from immobilies i left join anbieters a on a.immobilie_id = i.id where a.openimmo_anid in ('+prov_ids+') and i.deleted_at is null order by i.created_at desc, i.id desc limit '+per_page+' offset '+curr_page+'';
    	    console.log("78");
            dbConn.query(sql, function (err, data) {
    	        if (err) {
                    // console.log("err",err);
    	        	result(null, err);
    	        } else {
                    console.log('data',data);
    	        	result(null, data);
    	        }
    	    });
    }
// Get list of all properties by folder


// Delete created property
    Immobilie.deleteCreatedProperty = function(id,result){
    	var sql = 'select * from immobilies where `id` ='+id;
        dbConn.query(sql, function (err, data) {
            if (err) {
                result(null,err);
            } else {
                    let top_directory;
                    let directory;
                    let immo_id;
                    console.log(data);
                    for (var i = 0; i < data.length; i++) {
                        top_directory=data[i].top_directory;
                        directory=data[i].directory;
                        immo_id=data[i].id;
                    }
                    var dirpath='./openimmo/'+top_directory+'/'+directory;
                    // console.log(dirpath);

                    if(directory){
                        fs.rmdir(dirpath,{ recursive: true },removeDir);
                        function removeDir(err,data){
                            if (err) throw err;
                            console.log('folder has been deleted');
                        }
                    }

                    var sql_anbieter='select * from anbieters a where a.immobilie_id = '+immo_id+' and a.deleted_at is null'
                    dbConn.query(sql_anbieter,function(err,data){

                        let anb_id;
                        if(err){
                            result(null,err);
                        }
                        else{
                            for (var i = 0; i < data.length; i++) {
                                anb_id=data[i].id;
                                
                                var sql_anbieter='select * from openimmos o where o.anbieter_id = '+anb_id+' and o.deleted_at is null'
                                dbConn.query(sql_anbieter,function(err,data){

                                    if(err){
                                        result(null,'No Data Found!!');
                                    }
                                    else{
                                        let openimmos_id;
                                        for (var i = 0; i < data.length; i++) {
                                            openimmos_id=data[i].id;
                                        }
                                        dbConn.query('delete from immobilies where id='+id,function(err,data){
                                            if(err){
                                                result(null,'Something went wrong');
                                            }
                                            else{
                                                dbConn.query('delete from anbieters where id='+anb_id,function(err,data){
                                                    if(err){
                                                        result(null,'Something went wrong');
                                                    }
                                                    else{
                                                        dbConn.query('delete from openimmos where id='+openimmos_id,function(err,data){
                                                               if(err){
                                                                    result(null,'Something went wrong');
                                                               }
                                                               else{
                                                                   result(null,data);
                                                               }
                                                        }
                                                    )}
                                                }
                                            )}
                                        })
                                    }
                                });
                            }
                        }
                });

                
            }
        });
    }
// Delete created property


// Get list of all verkauft properties
    Immobilie.verkauftProperties = function(provider_id,per_page,curr_page,result){
            let pid;
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

            var sql="select * from immobilies i left join anbieters a on a.immobilie_id = i.id where json_unquote(json_extract(`zustand_angaben`, '$.verkaufstatus.stand')) = 'VERKAUFT' and a.openimmo_anid = "+pid+" and i.deleted_at is null order by i.created_at desc, i.id desc limit "+per_page+" offset "+curr_page+"";
            dbConn.query(sql, function (err, data) {
                if (err) {
                    result(null,err);
                } else {
                    console.log(data);
                    result(null,data);
                }
            });
    }
// Get list of all verkauft properties


// Custom method to display property by object id start
    Immobilie.getPropertyByObjectId = function(id,result){
        let obj_tmp;
        dbConn.query('SELECT * FROM immobilies i  where i.openimmo_obid like?','%'+ id + '%' ,(err,res)=>{
          if(err){
                  result(err,null);
          }
          else
          {

               obj_tmp=res;
               dbConn.query('SELECT * FROM anbieters a where a.immobilie_id='+obj_tmp[0]['id'], (err,res)=>{
                  if(err){
                    result(err,null);
                  }
                  else
                  {
                    obj_tmp[0]['anbieters']=res;
                    dbConn.query('SELECT * FROM openimmos o where o.anbieter_id='+obj_tmp[0]['anbieters'][0]['id'],(err,res)=>{
                      if(err){
                            result(err,null);    
                      }
                      else
                      {
                        obj_tmp[0]['openimmo']=res;
                        if(obj_tmp){
                          let v=obj_tmp[0]['verwaltung_techn'];
                          let y=JSON.parse(v);
                              let ver=y['user_defined_simplefield']['verkauft'];
                              if(ver==1){
                                result(null,"Property Sold");
                              }
                              else
                              {
                                result(null,obj_tmp[0]);
                              }

                        }
                        else
                        {
                          result(null, "Not found");  
                        }
                                  
                         
                      }
                    });
                   
                  }
                   
               });
          }
        });
    }
// Custom method to display property by object id end


// Custom method to display all property start
Immobilie.getAllProperty = function(per_page,page,result){  
  if(!per_page && !page)
      var sql='select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where  `immobilies`.`deleted_at` is null order by `created_at` desc';
    else    
      var sql='select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where  `immobilies`.`deleted_at` is null order by `created_at` desc  limit '+per_page+' offset '+page;
      dbConn.query(sql,function (err, res) {
        if(err) 
          result(null,err);
        else
          result(null,res);
      });                                                                                                                                                                                                                                                                                                                                                                                                                                                     
}
// Custom method to display all property end

module.exports = Immobilie;
