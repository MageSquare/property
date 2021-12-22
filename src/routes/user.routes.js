const express = require('express');
const Profiles = require('../models/profiles.model');
const userRoutes = express.Router();

// get Property created by user
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
// get Property created by user

module.exports = userRoutes;