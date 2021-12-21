const express=require('express');
const propertyRoutes = express.Router();

const Immobilie = require('../models/immobilies.model');


// #### Get one properties by id Start #####
  

propertyRoutes.route('/property').get(function (req, res){
	let id = req.query.id;  
  if(id)
  {
        Immobilie.getPropertyByObjectId(req.query.id,function(err, immobilie) {
        if (err){
            res.status(400).send("No Data found");
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

module.exports = propertyRoutes;
