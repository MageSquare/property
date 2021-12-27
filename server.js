const express = require('express'),
bodyParser = require('body-parser'),
cors = require('cors'),
jwt = require('jsonwebtoken'),
propertyRoutes= require('./src/routes/property.routes'),
userRoutes=require('./src/routes/user.routes');

app =express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.set('secretKey', '124ds#@$#@%AWsdcasjkoiashf98A^S!!@$#554d234fcaASdDAs');
app.set('expiresIn',30*60);

// Routes For API
  app.use('/api',propertyRoutes);
  app.use('/api/user',validateRequest,userRoutes);
// Routes For API

// Listing on Port
  const port = process.env.PORT || 8520;
  const server = app.listen(port, function(){
    var port = server.address().port;
    console.log("App listening at port:%s", port)
  });
// Listing on Port


function validateRequest(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    //check if bearer is undefined
    if(typeof bearerHeader !== 'undefined'){
        //split the space at the bearer
        const bearer = bearerHeader.split(' ');
        //Get token from string
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, app.get('secretKey'), function(err, decoded) {
          if (err) {
            res.status(403).json({msg: "Unauthorized"});
          }else{
            // get value of user whicha are set when create token
              req.body.userId = decoded.userId;
            // get value of user whicha are set when create token
            next();
          }
        });
    }else{
       res.status(403).json({msg: "Unauthorized"});
    }
  }