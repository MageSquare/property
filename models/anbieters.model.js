'use strict';

const dbConn = require('../config/db.config');
//anbieters object created

 
var Anbieters = function(anbieters){
  this.immobilie_id     			    = anbieters.immobilie_id;
  this.anbieternr      		        = anbieters.anbieternr;
  this.firma          				    = anbieters.firma;
  this.openimmo_anid        		  = anbieters.openimmo_anid;
  this.lizenzkennung   			      = anbieters.lizenzkennung;
  this.anhang    					        = anbieters.anhang;
  this.impressum      		        = anbieters.impressum;
  this.impressum_strukt        		= anbieters.impressum_strukt;
  this.user_defined_anyfield     	= anbieters.user_defined_anyfield;
  this.user_defined_simplefield   = anbieters.user_defined_simplefield; 
  this.created_at          			  = new Date();
  this.updated_at   				      = new Date();
  this.deleted_at    				      = new Date();
};


module.exports= Anbieters;