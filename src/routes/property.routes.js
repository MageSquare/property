const express=require('express');
const Immobilie = require('../models/immobilies.model');
const dbConn = require('../../config/db.config');
const propertyRoutes = express.Router();

// #### Get one properties by id Start #####
  propertyRoutes.route('/property').get(function (req, res){
  	let id = req.query.id;  
    if(id)
    {
          Immobilie.getPropertyByObjectId(req.query.id,function(err, immobilie) {
          if (err){
              res.status(400).send(err);
          }
          else  
          {
                res.status(200).send(immobilie);
          }
        });  
    }
    else
    {
      res.status(400).send("Invalid Id");
    }
  });
// #####  Get one properties by id End  ####


// Get All Properties Start
  propertyRoutes.route('/properties').get(function (req,res){
     let per_page=req.query.per_page;
     let page=req.query.page;
      Immobilie.getAllProperty(per_page,page,function (err,immobilie) {
          if (err){
              res.status(400).send("No Data found");
          }
          else
          {  
                res.status(200).send(immobilie);
          }
      });
  });
// Get All Properties End


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
//Fetch Property By Id by Get Method


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
// Get list of all properties by folder by POST method


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
// Delete created property


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
// Get list of all verkauft properties


module.exports = propertyRoutes;