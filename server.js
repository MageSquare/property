const express = require('express'),
bodyParser = require('body-parser'),
cors = require('cors'),
jwt = require('jsonwebtoken'),
propertyRoutes= require('./src/routes/property.routes'),
morgan = require('morgan'),
userRoutes=require('./src/routes/user.routes'),
dbConn = require('./config/db.config');

var geoip = require('geoip-lite');
require('dotenv').config();
app =express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('tiny'));

// Routes For API
  app.use('/api',logRequest,propertyRoutes);
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
        jwt.verify(bearerToken, process.env.JWT_SECRET, function(err, decoded) {
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

function logRequest(req,res,next){

    let statusCode;
    let statusMessage;
 
    var geo = geoip.lookup(req.ip);
    var ua = req.headers['user-agent'];

    let device = new Object();

    if (/mobile/i.test(ua)){
        device['Mobile'] = true;
    }

    if (/like Mac OS X/.test(ua)) {
        device['iOS'] = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
        device['iPhone'] = /iPhone/.test(ua);
        device['iPad'] = /iPad/.test(ua);
    }

    if (/Android/.test(ua)){
        device['Android'] = /Android ([0-9\.]+)[\);]/.exec(ua)[1];
    }

    if (/webOS\//.test(ua)){
       device['webOS'] = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];
    }

    if (/(Intel|PPC) Mac OS X/.test(ua)){
        device['Mac'] = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;
    }

    if (/Windows NT/.test(ua)){
        device['Windows'] = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];
    }

    let logged_details = new Object();

    res.on('close', () => {

          let ip_add=req.ip;
          template = /^::(ffff)?:(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/
          has_ipv4_version = template.test(ip_add);

          let final_ip;
          if(has_ipv4_version == true){
              final_ip = ip_add.replace(/^.*:/, '');
          }
          else{
              final_ip=ip_add;
          }
          
          statusCode = res.statusCode;
          statusMessage = res.statusMessage;

          if(statusMessage!=undefined){
            logged_details['statusMessage'] = JSON.stringify(statusMessage);
            logged_details['statusCode'] = JSON.stringify(statusCode); 
          }
          else{
            logged_details['statusMessage'] = null; 
            logged_details['statusCode'] = null; 
          }

          logged_details['logged_ip'] = JSON.stringify(final_ip);
          logged_details['api_path'] = JSON.stringify(req.originalUrl);

          if(req.headers["accept-language"]!=null){
            logged_details['lang'] = JSON.stringify(req.headers["accept-language"]);
          }
          else{
            logged_details['lang'] = null; 
          }

          logged_details['browser'] = JSON.stringify(req.headers['user-agent']);

          if(geo!=null){
            logged_details['country'] = JSON.stringify(geo.country);
            logged_details['region'] = JSON.stringify(geo.region);
            logged_details['city'] =JSON.stringify(geo.city);
            logged_details['ll'] = JSON.stringify(geo.ll);

          }
          else{
            logged_details['country'] = null;
            logged_details['region'] = null;
            logged_details['city'] =null;
            logged_details['ll'] = null;
          }

          logged_details['date'] = JSON.stringify(new Date('Y-m-d H:i:s'));
          logged_details['device'] = JSON.stringify(device); 

          let device_data = JSON.stringify(logged_details.device);
          let long_lat = JSON.stringify(logged_details.ll);

          var sql_query= 'Insert into logs (logged_ip,api_path,lang,browser,country,region,city,ll,date,device,statusCode,statusMessage) VALUES ('+logged_details.logged_ip+','+logged_details.api_path+','+logged_details.lang+','+logged_details.browser+','+logged_details.country+','+logged_details.region+','+logged_details.city+','+long_lat+','+logged_details.date+','+device_data+','+logged_details.statusCode+','+logged_details.statusMessage+')';
          dbConn.query(sql_query,function(err,data){
            if(err){
                let error = new Object();
                error['message']=err;
                next();
            }
            else{
                next();
            }
          });

    });

    next();
  }