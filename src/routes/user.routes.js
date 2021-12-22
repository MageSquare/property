const express = require('express');
const userRoutes = express.Router();
const mysql = require('mysql');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dbConn = require('../../config/db.config');
const Profiles = require('../models/profiles.model');

userRoutes.route('/get_my_created_property').get(function(req,res){
	
    let currentUser=2;
    let per_page=req.query.per_page;
    let curr_page=req.query.curr_page;

        Profiles.userProperties(currentUser,per_page,curr_page,function(err, data) {    
        if (err){
            res.status(400).send("No Data found");
        }
        else
        {
            res.status(200).send(data);
        }
    });
 
});

module.exports = userRoutes;