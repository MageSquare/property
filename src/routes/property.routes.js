const express=require('express');
const Immobilie = require('../models/immobilies.model');
const Providers = require('../models/providers.model');
const dbConn = require('../../config/db.config');
const propertyRoutes = express.Router();
var jwt = require('jsonwebtoken');
const { body,check, validationResult } = require('express-validator');

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
// #####  Get one properties by id End  ####  #


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
              res.status(400).send(err);
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
      let provider_id = req.body.value;
      let pageSize = req.body.per_page;
      let curr_page = req.body.curr_page;

          Immobilie.getProperties(provider_id,pageSize,curr_page,function(err, data) {    
              if (err){
                  res.status(400).send(err);
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
              res.status(400).send(err);
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
              res.status(400).send(err);
          }
          else
          {
              res.status(200).send(data);
          }
      });

  });
// Get list of all verkauft properties

// Register
propertyRoutes.route('/register').post(async function(req,res){

    await check('email',"Email is required").notEmpty().run(req);
    await check('password',"Password is required").notEmpty().run(req);
    await check('email',"Enter valid email Address").isEmail().run(req);
    await check('firstname',"Firstname is required").notEmpty().run(req);
    await check('lastname',"Lastname is required").notEmpty().run(req);
    await check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars long').run(req);
    await check('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/).withMessage('Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character.').run(req);

   const errors = validationResult(req);

   let firstname = req.body.firstname,
    lastname = req.body.lastname,
    email = req.body.email,
    password = req.body.password,
    phone = req.body.phone,
    firma = req.body.firma,
    provider_dir = req.body.provider_dir,
    state = req.body.state,
    city = req.body.city,
    pic = req.body.pic;

    let providers = new Providers(req.body);

    if(phone == null || phone == ''){

        providers.phone = null;
    }
    else{
        providers.phone = phone;
    }

    if(firma == null || firma == ''){
      
        providers.firma = null;
    }
    else{
        providers.firma = firma;
    }

    if(state == null || state == ''){
      
        providers.state = null;
    }
    else{
        providers.state = state;
    }

    if(city == null || city == ''){
      
        providers.city = null;
    }
    else{
        providers.city = city;
    }

    if(state == null || state == ''){
      
        providers.pic = null;
    }
    else{
        providers.pic = pic;
    }

    providers.fullname = firstname.concat(' ', lastname);
    providers.provider_dir = null;
    providers.role = 0;

    if (!errors.isEmpty()) {
            res.status(400).send(errors);
        }

    else
    {
        Providers.register(providers,function(err, data) {  
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

// Login
  propertyRoutes.route('/login'
  ).post([
    // body('email', 'Enter Valid Email Address','Email is required !').notEmpty().isEmail(),
    // body('password','Password is required !').notEmpty(),
    ],async function(req,res){
       await check('email',"Email is required").notEmpty().run(req);
       await check('password',"PAssword is required").notEmpty().run(req);
       await check('email',"Enter valid email Address").isEmail().run(req);
       const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors);
        }
        else {
            Providers.login(req.body.email,req.body.password,function(err,data){
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
// Login

// Forgot Password
 propertyRoutes.route('/forget_password').post(function(req,res){
   
   let origin_server = req.headers.host;
   let url = req.baseUrl;
   let receiver_email = req.body.email;

    Providers.forgetPassword(origin_server,url,receiver_email,function(err, data) {    

        if (err){
            res.status(400).send(err);
        }
        else
        {
          res.status(200).json({message : data});
        }
    });

});
// Forgot Password

// Reset Password
 propertyRoutes.route('/reset_password').post(async function(req,res){

             await check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars long').run(req);
             await check('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/).withMessage('Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character.').run(req);
            
              const errors = validationResult(req);
               
              if (!errors.isEmpty()) {
                    res.status(400).send(errors);
              }

              else{

                let token = req.query.token;
                jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){

                     if(err){

                         res.status(400).send('Sorry! Your Token May Expired.');
                     }
                     else{

                         let user_id = req.body.id;
                         let new_pswd = req.body.password;
                         Providers.resetPassword(user_id,new_pswd, function(err, data) {   

                              if (err){
                                res.status(400).send(err);
                              }
                              else{
                                res.status(200).send({message:'Your Password Has Been Reset Now.'});
                              }

                          }); 
                     }

                });

              }

});
// Reset Password

module.exports = propertyRoutes;
