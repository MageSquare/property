const express = require('express');
const Providers = require('../models/providers.model');
const Immobilie = require('../models/immobilies.model');
const ImmobilieEvaluate = require('../models/immobilieevaluate.model');
const userRoutes = express.Router();

// get Property created by user
    userRoutes.route('/get_my_created_property').get(function(req,res){
        let currentUser=req.body.userId;
        let per_page=req.query.per_page;
        let curr_page=req.query.curr_page;

            Immobilie.userProperties(currentUser,per_page,curr_page,function(err, data) {    
            if (err){
                res.status(400).send(err);
            }
            else
            {
                res.status(200).send(data);
            }
        });
    });
// get Property created by user

// get current user login detail 
    userRoutes.route('/get').get(function(req,res){
        var id = req.body.userId;
        Providers.getUser(id,function(err,data){
            if (err){
                res.status(400).send(err);
            }
            else
            {
                res.status(200).send(data);
            }
        });
    });
// get current user login detail 

// Get evaluation by the current user id
   userRoutes.route('/get_my_created_evaluation').get(function(req,res){
      let userid = req.body.userId;
      let pageSize;
      let curr_page;
      if(req.query.per_page){
          pageSize = req.query.per_page;
      }
      else{
          pageSize = 10;
      }
      if(req.query.curr_page){
          curr_page = req.query.curr_page;
      }
      else{
          curr_page = 1;
      }
      
      ImmobilieEvaluate.getmycreatedEvaluation(userid,pageSize,curr_page,function(err, data) { 
          if (err){
              res.status(400).send(err);
          }
          else
          {
              res.status(200).send(data);
          }
      });

   });
// Get evaluation by the current user id
module.exports = userRoutes;