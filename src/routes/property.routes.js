const express=require('express');
const Immobilie = require('../models/immobilies.model');
const Profiles = require('../models/profiles.model');
const Users = require('../models/users.model');
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

// Register
propertyRoutes.route('/register').post(function(req,res){
    let firstname = req.body.firstname,
    lastname = req.body.lastname,
    email = req.body.email,
    password = req.body.password,
    emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(firstname == null || firstname =='' && lastname ==null || lastname ==''){
        res.status(400).send("First Name and Last Name are required fields.");
    }
    else if(email==null || email =='' || emailRegexp.test(email)==false){
        res.status(400).send("Please Enter Email Address With True Format (e.g. - example@example.com).");
    }
    else if(password == null || password == ''){
        res.status(400).send("Please Enter Password");
    }
    else{
        Profiles.register(firstname,lastname,email,password,function(err, data) {  
            if (err){
                res.status(400).send(err);
            }
            else
            {
               res.status(200).json(data);
            }

          });
    }

});
// register

module.exports = propertyRoutes;