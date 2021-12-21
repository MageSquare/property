'use strict';

const dbConn = require('../config/db.config');
//openimmos object created


var Openimmos = function(openimmos){
  this.anbieter_id     			    = openimmos.anbieter_id;
  this.art      		            = openimmos.art;
  this.umfang          				  = openimmos.umfang;
  this.modus        		        = openimmos.modus;
  this.version   			          = openimmos.version;
  this.sendersoftware    				= openimmos.sendersoftware;
  this.senderversion      		  = openimmos.senderversion;
  this.techn_email        		  = openimmos.techn_email;
  this.regi_id     				      = openimmos.regi_id;
  this.timestamp     				    =  new Date();
  this.user_defined_anyfield    = openimmos.user_defined_anyfield;
  this.user_defined_simplefield = openimmos.user_defined_simplefield;
  this.created_at          			= new Date();
  this.updated_at   				    = new Date();
  this.deleted_at    				    = new Date();
};

  
module.exports= Openimmos;