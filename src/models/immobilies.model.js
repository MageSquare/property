'use strict';

var dbConn = require('./../../config/db.config');
//immobilies object create

  
var Immobilie = function(immobilie){
  this.openimmo_obid     			 = immobilie.openimmo_obid;
  this.objektkategorie      		 = immobilie.objektkategorie;
  this.geo          				 = immobilie.geo;
  this.kontaktperson        		 = immobilie.kontaktperson;
  this.weitere_adresse   			 = immobilie.weitere_adresse;
  this.preise    					 = immobilie.preise;
  this.bieterverfahren      		 = immobilie.bieterverfahren;
  this.versteigerung        		 = immobilie.versteigerung;
  this.flaechen     				 = immobilie.flaechen;
  this.ausstattung     				 = immobilie.ausstattung;
  this.zustand_angaben     			 = immobilie.zustand_angaben;
  this.bewertung      				 = immobilie.bewertung;
  this.infrastruktur        		 = immobilie.infrastruktur;
  this.freitexte          			 = immobilie.freitexte;
  this.anhaenge   					 = immobilie.anhaenge;
  this.verwaltung_objekt    		 = immobilie.verwaltung_objekt;
  this.verwaltung_techn     		 = immobilie.verwaltung_techn;
  this.user_defined_simplefield      = immobilie.user_defined_simplefield;
  this.user_defined_anyfield         = immobilie.user_defined_anyfield;
  this.user_defined_extend           = immobilie.user_defined_extend;
  this.update_time   				 = new Date();
  this.top_directory    			 = immobilie.top_directory;
  this.directory          			 = immobilie.directory;
  this.created_at          			 = new Date();
  this.updated_at   				 = new Date();
  this.deleted_at    				 = new Date();
};

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
                            result(null,res);
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
  if(!per_page && !page){
      dbConn.query('select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where  `immobilies`.`deleted_at` is null order by `created_at` desc',function (err, res) {
        if(err){ 
          result(null,err);
        }  
        else
        {
        
          result(null,res); 
        }

      });
  } 
  else {
       dbConn.query('select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where  `immobilies`.`deleted_at` is null order by `created_at` desc  limit '+per_page+' offset '+page,function (err, res) {
          
        if(err){ 
          result(null,err);
        }  
        else
        {
          result(null,res); 
        }
    });
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                     

}

// Custom method to display all property end


module.exports= Immobilie;

