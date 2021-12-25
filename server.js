const express = require('express'),
bodyParser = require('body-parser'),
propertyRoutes= require('./src/routes/property.routes'),
cors = require('cors'),
userRoutes=require('./src/routes/user.routes');

app =express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());


// Routes For API
  app.use('/api',propertyRoutes);
  app.use('/api/user',userRoutes);
// Routes For API

// Listing on Port
  const port = process.env.PORT || 8520;
  const server = app.listen(port, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("App listening at %s:%s", host, port)
  });
// Listing on Port