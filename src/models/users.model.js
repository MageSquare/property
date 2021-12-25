'use strict';
const dbConn = require('../../config/db.config');

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

module.exports = Users;