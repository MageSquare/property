const express = require('express');
const propertyRoutes = express.Router();
const mysql = require('mysql');
const Immobilie = require('../models/immobilies.model');
const dbConn = require('../../config/db.config');
const app = express();

//Fetch Property By Id by Get Method
propertyRoutes.route('/fetch_property').get(function (req, res){
    const id = req.query.id;
    Immobilie.fetchProperty(id,function(err, immobiles) {    
        if (err){
            res.status(400).send("No Data found");
        }
        else
        {
            res.status(200).send(immobiles);
        }
  });
});


// Get list of all properties by folder by POST method
propertyRoutes.route('/properties').post(function(req,res){
    console.log(req);
    let provider_id = req.query.value;
    let pageSize = req.query.per_page;
    let curr_page = req.query.curr_page;

        Immobilie.getProperties(provider_id,pageSize,curr_page,function(err, data) {    
            if (err){
                res.status(400).send("No Data found");
            }
            else
            {
                res.status(200).send(data);
            }
    });

});


// Delete created property
propertyRoutes.route('/delete_my_created_property').delete(function(req,res){
    const id = req.query.id;
    Immobilie.deleteCreatedProperty(id,function(err, data) {    
        if (err){
            res.status(400).send("No Data found");
        }
        else
        {
            res.status(200).send(data);
        }
    });

});

// Get list of all verkauft properties
propertyRoutes.route('/verkauft-properties').get(function(req,res){
    let provider_id = req.query.provider_id;
    let pageSize = req.query.per_page;
    let curr_page = req.query.curr_page;
    Immobilie.verkauftProperties(provider_id,pageSize,curr_page,function(err, data) {    
        if (err){
            res.status(400).send("No Data found");
        }
        else
        {
            res.status(200).send(data);
        }
    });

});

module.exports = propertyRoutes;