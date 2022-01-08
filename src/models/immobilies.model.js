'use strict';
const dbConn = require('../../config/db.config');
const fs = require('fs');
const extract = require('extract-zip');  //Module TO Extract Zip Files
const path = require('path');            //Module To Get Root Path
const xml2js = require('xml2js');        //Module To Convert Xml Data To JSON
const parser = new xml2js.Parser({ attrkey: "ATTR" });   
const mydate = require('date-and-time');
const xmlParser  = require('xml2json');

var Immobilie = function(immobilie){
    this.openimmo_obid                = immobilie.openimmo_obid;
    this.objektkategorie            = immobilie.objektkategorie;
    this.geo                        = immobilie.geo;
    this.kontaktperson                = immobilie.kontaktperson;
    this.weitere_adresse            = immobilie.weitere_adresse;
    this.preise                        = immobilie.preise;
    this.bieterverfahren            = immobilie.bieterverfahren;
    this.versteigerung                = immobilie.versteigerung;
    this.flaechen                    = immobilie.flaechen;
    this.ausstattung                = immobilie.ausstattung;
    this.zustand_angaben            = immobilie.zustand_angaben;
    this.bewertung                    = immobilie.bewertung;
    this.infrastruktur                = immobilie.infrastruktur;
    this.freitexte                    = immobilie.freitexte;
    this.anhaenge                    = immobilie.anhaenge;
    this.verwaltung_objekt            = immobilie.verwaltung_objekt;
    this.verwaltung_techn            = immobilie.verwaltung_techn;
    this.user_defined_simplefield    = immobilie.user_defined_simplefield;
    this.user_defined_anyfield        = immobilie.user_defined_anyfield;
    this.user_defined_extend        = immobilie.user_defined_extend;
    this.update_time                = new Date();
    this.top_directory                = immobilie.top_directory;
    this.directory                    = immobilie.directory;
    this.created_at                    = new Date();
    this.updated_at                    = new Date();
    this.deleted_at                    = new Date();
}

// Fetch Property By Id
    Immobilie.fetchProperty = function(id,result){
      var sql = 'select * from immobilies where id ='+id;
        dbConn.query(sql, function (err, res) {
            if (err) {
              let error = new Object();
              error['message']='Something went wrong!';
              result(error, null);
            } else {
              if(res.length>0){
                  result(null, res);
              }
              else{
                let error = new Object();
                error['message']='Data Not Found!';
                result(error, null);
              }
            }
        });
    }
// Fetch Property By Id


// Get list of all properties by folder
    Immobilie.getProperties = function(pids,per_page,curr_page,result){
        let pid;
        let providerids = [];
        let prov_ids;
        let p_id;
          for (var i = 0; i < pids.length; i++) {
              pid=pids[i];
              
              if(pid < 10){
                  providerids.push('0000'+pid);
              }
              else if(pid < 100){
                  providerids.push('000'+pid);   
              }
              else if(pid < 1000){
                  providerids.push('00'+pid);   
              }
              else if(pid < 10000){
                  providerids.push('0'+pid);   
              }
              prov_ids=providerids;
          }

          let offset = (curr_page-1)*per_page;
          var sql_query = 'select * from immobilies i left join anbieters a on a.immobilie_id = i.id where a.openimmo_anid in ('+prov_ids+') and i.deleted_at is null order by i.id desc';
          var sql =sql_query+' limit '+ per_page +' offset '+ offset +' ';
          dbConn.query(sql, function (err, data) {
              if (err) {
                let error = new Object();
                error['message']='No Data Found!';
                result(error, null);
              } else {
                result(null, data);
              }
          });
    }
// Get list of all properties by folder


// Delete created property
    Immobilie.deleteCreatedProperty = function(id,result){
        var sql = 'select * from immobilies where `id` ='+id;
        dbConn.query(sql, function (err, data) {
            if (err) {
                    let error = new Object();
                    error['message']='Something went wrong!';
                    result(error, null);
            } else {
                    let top_directory;
                    let directory;
                    let immo_id;
                    for (var i = 0; i < data.length; i++) {
                        top_directory=data[i].top_directory;
                        directory=data[i].directory;
                        immo_id=data[i].id;
                    }
                    var dirpath='./openimmo/'+top_directory+'/'+directory;

                    if(directory){
                        fs.rmdir(dirpath,{ recursive: true },removeDir);
                        function removeDir(err,data){
                            if (err) throw err;
                            console.log('folder has been deleted');
                        }
                    }

                    var sql_anbieter='select * from anbieters a where a.immobilie_id = '+immo_id+' and a.deleted_at is null'
                    dbConn.query(sql_anbieter,function(err,data){

                        let anb_id;
                        if(err){
                          let error = new Object();
                          error['message']='No Data Found!';
                          result(error, null);
                        }
                        else{
                            for (var i = 0; i < data.length; i++) {
                                anb_id=data[i].id;
                                
                                var sql_anbieter='select * from openimmos o where o.anbieter_id = '+anb_id+' and o.deleted_at is null'
                                dbConn.query(sql_anbieter,function(err,data){

                                    if(err){
                                        let error = new Object();
                                        error['message']='No Data Found!';
                                        result(error, null);

                                    }
                                    else{
                                        let openimmos_id;
                                        for (var i = 0; i < data.length; i++) {
                                            openimmos_id=data[i].id;
                                        }
                                        dbConn.query('delete from immobilies where id='+id,function(err,data){
                                            if(err){
                                              let error = new Object();
                                              error['message']='Can not delete record from immobilies!';
                                              result(error, null);
                                            }
                                            else{
                                                dbConn.query('delete from anbieters where id='+anb_id,function(err,data){
                                                    if(err){
                                                        let error = new Object();
                                                        error['message']='Can not delete record from anbieters!';
                                                        result(error, null);
                                                    }
                                                    else{
                                                        dbConn.query('delete from openimmos where id='+openimmos_id,function(err,data){
                                                               if(err){
                                                                    let error = new Object();
                                                                    error['message']='Can not delete record from openimmos!';
                                                                    result(error, null);
                                                               }
                                                               else{
                                                                   result(null,"Record has deleted for id: " + immo_id);
                                                               }
                                                        }
                                                    )}
                                                }
                                            )}
                                        })
                                    }
                                });
                            }
                        }
                });

                
            }
        });
    }
// Delete created property

// Get list of all verkauft properties
    Immobilie.verkauftProperties = function(provider_id,per_page,curr_page,result){
            let pid;
            if(provider_id){ 
                if(provider_id < 10){
                    pid=('0000'+provider_id);
                }
                else if(provider_id < 100){
                    pid=('000'+provider_id);   
                }
                else if(provider_id < 1000){
                    pid=('00'+provider_id);   
                }
                else if(provider_id < 10000){
                    pid=('0'+provider_id);   
                }
            }

            let offset = (curr_page-1)*per_page;
            
            var sql_query = "select * from immobilies i left join anbieters a on a.immobilie_id = i.id where json_unquote(json_extract(`zustand_angaben`, '$.verkaufstatus.stand')) = 'VERKAUFT' and a.openimmo_anid = "+pid+" and i.deleted_at is null order by i.id desc";
            var sql=sql_query+" limit "+ per_page +" offset "+ offset +" ";

            dbConn.query(sql, function (err, data) {
                if (err) {
                    let error = new Object();
                    error['message']='Something went wrong!';
                    result(error, null);
                } else {
                    result(null,data);
                }
            });
    }
// Get list of all verkauft properties


// Custom method to display property by object id start
    Immobilie.getPropertyByObjectId = function(id,result){
        let obj_tmp;
        dbConn.query('SELECT * FROM immobilies i  where i.openimmo_obid like?','%'+ id + '%' ,(err,res)=>{
          if(err){
                  result(err,null);
          }
          else
          {

               obj_tmp=res;
               dbConn.query('SELECT * FROM anbieters a where a.immobilie_id='+obj_tmp[0]['id'], (err,res)=>{
                  if(err){
                    result(err,null);
                  }
                  else
                  {
                    obj_tmp[0]['anbieters']=res;
                    dbConn.query('SELECT * FROM openimmos o where o.anbieter_id='+obj_tmp[0]['anbieters'][0]['id'],(err,res)=>{
                      if(err){
                            result(err,null);    
                      }
                      else
                      {
                        obj_tmp[0]['openimmo']=res;
                        if(obj_tmp){
                          let v=obj_tmp[0]['verwaltung_techn'];
                          let y=JSON.parse(v);
                              let ver=y['user_defined_simplefield']['verkauft'];
                              if(ver==1){
                                var error = new Object();
                                error['message'] = "Property Sold !";
                                result(error,null);
                              }
                              else
                              { 
                                // let m=obj_tmp[0]['freitexte'];
                                // let object=JSON.parse(m);
                                // let object_title=object.objekttitel;
                                result(null,obj_tmp[0]);
                              }

                        }
                        else
                        {
                          result(null, "Not found");    
                        }
                                  
                          
                      }
                    });
                   
                  }
                   
               });
          }
        });
    }
// Custom method to display property by object id end


// Custom method to display all property start
    Immobilie.getAllProperty = function(per_page,page,result){  
      if(!per_page && !page)
          var sql='select * from `immobilies`  where  `immobilies`.`deleted_at` is null order by `id` desc';
        else{
          var offset = (per_page * (page - 1));
          var sql='select * from `immobilies`  where  `immobilies`.`deleted_at` is null order by `id` desc  limit '+per_page+' offset '+offset;
          dbConn.query(sql,function (err, res) {
            if(err) 
              result(null,err);
            else{
               var total_count_q = "select * from `immobilies`  where  `immobilies`.`deleted_at` is null order by `id` desc";
               dbConn.query(total_count_q,function (err,ress){
                    var totalPage=0;
                    if(!page && !page){
                        totalPage = 0;
                    }else{
                        if(per_page != 0 ){
                           totalPage= Math.ceil((ress.length)/per_page);
                        }else{
                            totalPage = 0;
                        }
                    }
                    // console.log(res);
                    // res.forEach((item)=>{
                    //     console.log(item.freitexte);
                    // });
                  var data = new Object();
                  data['data'] = res;
                  data['page'] = page;
                  data['last_page'] = totalPage;
                  result(null,data);
               });
            }
          }); 
        }                                                                                                                                                                                                                                                                                                                                                                                                                                                        
    }
// Custom method to display all property end

// Get Properties by login user
    Immobilie.userProperties = function(currentUser,per_page,curr_page,result){
        let offset = (curr_page-1)*per_page;
          var sql = "select * from providers p where id = "+currentUser+" ";
          dbConn.query(sql,function(err,data){
              if(err){
                let error = new Object();
                error['message']='Something went wrong!';
                result(error, null);
              }
              else{
                let pid;
                  for (var i = 0; i < data.length; i++) {
                      let provider_id = data[i].provider_dir;
                      pid=provider_id;
                  }
                  var sql_query = "select * from immobilies i where json_unquote(json_extract(`verwaltung_techn`, '$.aktion.aktionart')) = 'CHANGE' and top_directory = "+pid+" ";
                  if(!per_page && curr_page){
                    var sql= sql_query + " offset "+ offset +"";
                  }  
                  else if(per_page && !curr_page){
                    var sql=sql_query+ " limit "+ per_page +" ";
                  }
                  
                  else if(!per_page && !curr_page){
                    var sql=sql_query
                  }
                  else if(per_page && curr_page){
                    var sql=sql_query+ " limit "+ per_page +" offset "+ offset+"";
                  }
                      dbConn.query(sql, function (err, data) {
                      if (err) {
                        let error = new Object();
                        error['message']='No Data Found!';
                        result(error, null);

                      } else {
                        result(null,data);
                      }
                  });
              }
          });
    }
// Get Properties by login user



// Hiteshree Custom method to display Import Api Start

// Main function start

    Immobilie.importProperty =   function(result){
     
      var rootfolders = readFolder('openimmo/');
      var files = [];     //Store All Files
      var exist_zip =[];  //Store Exists Zip names
      var new_zip =[];    //Store New zip names
      var xml_array =[];   //Store XML file list
      var xml_readdata =[]; //Store Result of XML to xml_readdata array
      var openimmo_obid_arr=[]; //Store openimmo_obid(read from xml file)
      var res1;

          // Get Zip files from root(source) folders start
          rootfolders.forEach(folder=>{
            var file = readFolder('openimmo/'+folder);
            file.forEach(items=>{
              files.push(items);
            });

          });
          // Get Zip files from root(source) folders end


          var ress,makesubfolders;
          ress= checkFileExist(files);    // Check and get  Zip File already exists in db or not
          ress.then((data)=>{             // Return result of zip which is availale in db
            exist_zip=data;               // Add already available zip to exist_zip array
            var myarr=files;
            var d;
         
            for (var i = 0; i < myarr.length; i++) {
              var f=false;
              var val=myarr[i];                                       
              for (var j = 0; j < exist_zip.length; j++) {
                  if(val == exist_zip[j].filename){             //Compare files of both array
                    f=true;
                    break;
                }
              }

              if(f==false){
                new_zip.push(val);       //Push Zip names to new_zip which is not available in db
              }
            }
          
            if(new_zip.length>0){       //If new_zip contains any one zip(>0)

                 var add_arr=[],del_arr=[];   //Add and Del Array to Store property which are to be added and deleted
                 
                 var make_zipfolders_xmlfiles=  make_zipfolder_xmlfile(rootfolders,new_zip);  //make zip folders and extract zip files
                
                 make_zipfolders_xmlfiles.then((data)=>{       
            
                      xml_array=data;                 //If result returns, store data to xml_array

                      setTimeout(()=>{                //Set time that executes read_xml and other code after specified time of extraction completion 

                          var readxml= read_xml(xml_array);   //To Read Xml Data
                          
                          readxml.then((data)=>{
                              xml_readdata=data;            //Store result of XML to xml_readdata array
                              
                              xml_readdata.forEach(xmlread_arr=>{
                                 
                                  const jp = JSON.parse(xmlread_arr);  
                                  var openimmo_obid=jp['openimmo']['anbieter']['immobilie']['verwaltung_techn']['openimmo_obid'];

                                  openimmo_obid_arr.push(openimmo_obid);    //push openimmo_obid into openimmo_obid_arr array  
                              }); 

                              var check_openimmo_obid= db_check_openimmo_obid(openimmo_obid_arr);  //check openimmo_obid available in db or not
 
                              check_openimmo_obid.then((data)=>{        //If openimmo_obid is there then add and delete data
                    
                                  var delete_data = db_delete_data(data['del_arr']);    //To Delete data from db

                                  var add_data = db_add_data(xml_array,xml_readdata,new_zip);   //To add data into db
                                  
                                  var final_object={
                                      "exists_file":exist_zip,
                                      "database_updated_file":new_zip
                                  }                                   //Return FinalObject that shows list of exists file and updated file(Add & delete)

                                  result(null,final_object);  
                              });
                          }); 
                      },1000);
                });
            }
            else
            {
          
                var ext={
                    "exist_zip":exist_zip
                }                         //Returns only exists zip if noy added any newly zip
                result(null,ext);
          }
      });
    }

// Main function end

//Make Zip Folders and extract zip files to destination start

function make_zipfolder_xmlfile(rootfolders,new_zip){
  
  return new Promise((resolve,reject)=>{
    var zip_folder,file,i;
    var latest_array = [];

    //get whole path and make directory if not exists start

    var root=path.resolve("./");
    var path2 = root.replace(/\\/g, "/");  
    new_zip.forEach(zip=>{
       
        zip_folder=zip.substring(0,zip.length -4);  
        var zip_folder_proid=zip.substring(0,5);

        var zip_path="/unzip/"+zip_folder_proid+"/"+zip_folder;
            
        var dirn=readFolder('unzip/');
        var subfolder="unzip/"+zip_folder_proid;  
        
        if(!fs.existsSync(subfolder)){  
            fs.mkdirSync(subfolder); 
        }  

        var final=subfolder+"/"+zip_folder;
        

        if(!fs.existsSync(final)){ 
          fs.mkdirSync(final);      
        }  
        
        var source="openimmo/"+zip_folder_proid+"/"+zip;

      //get whole path and make directory if not exists start

      //extract and push data into latest array start

        var d=myextract(source,path2,zip_path,zip_folder);
                 
          d.then(data=>{
      
               latest_array.push(data);
               if(latest_array.length==new_zip.length)
                    resolve(latest_array);
               
          });     
      
      //extract and push data into latest array start
      }); 
  });   
}

//Make Zip Folders and extract zip files to destination end


//Extract Zip Files Start

function myextract(source,path2,zip_path,zip_folder) {

  return new Promise((resolve,reject)=>{ 
   if(extract(source, { dir: path2+zip_path })){
    resolve(zip_folder+".xml");
   }
  });
}

//Extract Zip Files End


//Read Data from xml file start

function read_xml(xml_array){
  
  var latest_xml =[];

  return new Promise((resolve,reject)=>{  
    var root=path.resolve("./");
    var path2 = root.replace(/\\/g, "/");  
    var dir="unzip/";  
 
    for(var i=0;i<xml_array.length;i++){  //xml_array contains total properties to be read
              
          var zip_folder=xml_array[i].substring(0,xml_array[i].length -4);  
          var zip_folder_proid=xml_array[i].substring(0,5);
          var final=dir+zip_folder_proid+"/"+zip_folder+"/"+xml_array[i];
          var finalpath=path2+"/"+final;
          let xml_string= fs.readFileSync(finalpath,'utf8');    //read xml file
           try{
             let data = xmlParser.toJson(xml_string);  //parse xml fle data to json
             latest_xml.push(data);  
             resolve(latest_xml);
         }catch(err){
             console.log(err)
         }
       }
        resolve(latest_xml);
    });
}  

//Read Data from xml file end

//Check openimmo_obid is available in db or not and based on that decide whether to add or delete property start

function db_check_openimmo_obid(xml_openimmo_obid){

  var add_arr =[];
  var del_arr =[];
  var flag=0;
  var obj;
  var add_len,xml_openimmo_obid_len;
  
  return new Promise((resolve,reject)=>{

    xml_openimmo_obid.forEach(openimmo_obid=>{      //foreach openimmo_obid's array
       
  
         dbConn.query('SELECT * FROM immobilies i  where i.openimmo_obid like?','%'+ openimmo_obid + '%' ,async function(err,res){  //check if id is available in db or not
            if(err){
                console.log(err);  
            }
            else 
            {        
                if(typeof res!="undefined")          //if result is not undefined
                {                                                //then
                    del_arr.push(openimmo_obid);           //push to delete array
                }                                                //otherwise
                    add_arr.push(openimmo_obid);           //push to add array
            }        
             
               add_len=add_arr.length;
               xml_openimmo_obid_len=xml_openimmo_obid.length;
            
                if(add_len==xml_openimmo_obid_len)
                {
                    obj={                                //resolve object when length of add and xml_openimmo_obid is become same
                      "add_arr":add_arr,
                      "del_arr":del_arr
                    }    
                    resolve(obj); 
                }   
          });
      });
  });
}
 
//Check openimmo_obid is available in db or not and based on that decide whether to add or delete property end

//Delete property from db which is already available start 

function db_delete_data(del_data){
  var openimmo_obid=del_data;
  
   return new Promise((resolve,reject)=>{      
    
   del_data.forEach(del=>{
      dbConn.query('SELECT id from immobilies i  where i.openimmo_obid like?','%'+ del + '%',function(err,res){ 
          if(res)
            res.forEach(anb=>{
              dbConn.query('SELECT id from anbieters a where a.immobilie_id='+anb.id,function(err,res1){
                
                if(res1)
                  res1.forEach(open=>{
                    
                      dbConn.query('SELECT id from openimmos o where o.anbieter_id='+open.id,function(err,res2){
                       
                        res2.forEach(del_open=>{
                            dbConn.query('DELETE from openimmos where id='+del_open.id,function(err,res3){

                             });
                             res1.forEach(del_anb=>{
                                 dbConn.query('DELETE from anbieters where id='+del_anb.id,(err,res4)=>{

                                 });
                                res.forEach(del_imm=>{
                                    dbConn.query('DELETE from immobilies where id='+del_imm.id);
                                });
                             });        
                          });
                        });
                      });
                 });
           });
      });
   });
});
}  

//Delete property from db which is already available end

//Add Property into db which is not available in db start

function db_add_data(xml_array,xml_readdata,new_zip){
    
   return new Promise((resolve,reject)=>{
     
      var dir=0;
       xml_readdata.forEach(xmlread_arr=>{
                  
                  var my_dir=xml_array[dir].substring(0,xml_array[dir].length -4);
                  var top=xml_array[dir].substring(0,5);

                  var zipfilename=new_zip[dir];
            
                  const jp = JSON.parse(xmlread_arr); //Parse json data
                  var openimmo_obid=jp['openimmo']['anbieter']['immobilie']['verwaltung_techn']['openimmo_obid'];

                  // immobilies table 

                  // 1...freitexte field

                  var user_freitexte_objekttitel=jp['openimmo']['anbieter']['immobilie']['freitexte']['objekttitel'];
                  var user_freitexte_ausstatt_beschr=jp['openimmo']['anbieter']['immobilie']['freitexte']['ausstatt_beschr'];
                  var user_freitexte_lage=jp['openimmo']['anbieter']['immobilie']['freitexte']['lage'];
                  var freitexte=jp['openimmo']['anbieter']['immobilie']['freitexte'];
                  var user_freitexte_arr=freitexte;
                  var obj_null="{}";   

                  if(typeof user_freitexte_objekttitel == "undefined")
                  {
                      user_freitexte_arr['objekttitel']=obj_null;
                  }
                  if(typeof user_freitexte_ausstatt_beschr == "undefined")
                  {
                      user_freitexte_arr['ausstatt_beschr']=obj_null;
                  }
                  if(typeof user_freitexte_lage == "undefined")
                  {
                      user_freitexte_arr['lage']=obj_null;   
                  }
                

                  // 2...geo field

                  var user_geo_ort=jp['openimmo']['anbieter']['immobilie']['geo']['ort'];
                  var user_geo_plz=jp['openimmo']['anbieter']['immobilie']['geo']['plz'];
                  var geo=jp['openimmo']['anbieter']['immobilie']['geo'];
                  var user_geo_arr=geo;

                  if(typeof user_geo_ort == "undefined")
                  {
                      user_geo_arr['ort']=obj_null;
                  }
                  if(typeof user_geo_plz == "undefined")
                  {
                      user_geo_arr['plz']=obj_null;
                  }

                  
                  // 3...flaechen field

                  var user_flaechen_wohnflaeche=jp['openimmo']['anbieter']['immobilie']['flaechen']['wohnflaeche'];
                  var user_flaechen_anzahl_zimmer=jp['openimmo']['anbieter']['immobilie']['flaechen']['anzahl_zimmer'];
                  var user_flaechen_grundstuecksflaeche=jp['openimmo']['anbieter']['immobilie']['flaechen']['grundstuecksflaeche'];
                  var flaechen=jp['openimmo']['anbieter']['immobilie']['flaechen'];
                  var user_flaechen_arr=flaechen;

                  if(typeof user_flaechen_wohnflaeche == "undefined")
                  {
                      user_flaechen_arr['wohnflaeche']=obj_null;
                  }
                  if(typeof user_flaechen_anzahl_zimmer == "undefined")
                  {
                      user_flaechen_arr['anzahl_zimmer']=obj_null;
                  }
                  if(typeof user_flaechen_grundstuecksflaeche == "undefined")
                  {
                      user_flaechen_arr['grundstuecksflaeche']=obj_null;
                  }
                  
                  // 4...verwaltung_techn field

                  var user_vertech_value=jp['openimmo']['anbieter']['immobilie']['verwaltung_techn'];
                  var user_vertech_value_arr=user_vertech_value;

                  if(typeof user_vertech_value == "undefined")
                  {
                      user_vertech_value_arr['verwaltung_techn']=obj_null;
                  }
                  
                  // 5...anhaenge field

                  var user_anhaenge_anhang=jp['openimmo']['anbieter']['immobilie']['anhaenge']['anhaenge'];
                  var user_anhaenge_daten_pfad=jp['openimmo']['anbieter']['immobilie']['anhaenge']['pfad'];
                  var user_anhaenge=jp['openimmo']['anbieter']['immobilie']['anhaenge'];
                  var user_anhaenge_arr=user_anhaenge;

                  if(typeof user_anhaenge_anhang == "undefined")
                  {
                      user_anhaenge_arr['anhaenge']=obj_null;
                  }
                  if(typeof user_anhaenge_daten_pfad == "undefined")
                  {
                      user_anhaenge_arr['pfad']=obj_null;
                  }
                  
                  // 6...objektkategorie field

                  var user_objektkategorie_nutzungsart=jp['openimmo']['anbieter']['immobilie']['objektkategorie']['nutzungsart'];
                  var user_objektkategorie_objektart=jp['openimmo']['anbieter']['immobilie']['objektkategorie']['objektart'];
                  var user_objektkategorie=jp['openimmo']['anbieter']['immobilie']['objektkategorie'];
                  var user_objektkategorie_arr=user_objektkategorie;
                 
          
                  if(typeof user_objektkategorie_nutzungsart == "undefined")
                  {
                      user_objektkategorie_arr['nutzungsart']=obj_null;
                  }
                  if(typeof user_objektkategorie_objektart == "undefined")
                  {
                      user_objektkategorie_arr['objektart']=obj_null;
                  }
                  

                  // 7...zustand_angaben field

                  var user_zustand_angaben_baujahr=jp['openimmo']['anbieter']['immobilie']['zustand_angaben']['baujahr'];
                  var user_zustand_angaben_energiepass=jp['openimmo']['anbieter']['immobilie']['zustand_angaben']['energiepass'];
                  var user_zustand_angaben_energiepass_gueltig_bis=jp['openimmo']['anbieter']['immobilie']['zustand_angaben']['energiepass']['gueltig_bis'];
                  var user_zustand_angaben_energiepass_endenergiebedarf=jp['openimmo']['anbieter']['immobilie']['zustand_angaben']['energiepass']['endenergiebedarf'];
                  var user_zustand_angaben_energiepass_primaerenergietraeger=jp['openimmo']['anbieter']['immobilie']['zustand_angaben']['energiepass']['primaerenergietraeger'];
                  var user_zustand_angaben_energiepass_wertklasse=jp['openimmo']['anbieter']['immobilie']['zustand_angaben']['energiepass']['wertklasse'];
                  var user_zustand_angaben_user_defined_simplefield_epass_baujahr=jp['openimmo']['anbieter']['immobilie']['zustand_angaben']['user_defined_simplefield'];
                  var user_zustand_angaben=jp['openimmo']['anbieter']['immobilie']['zustand_angaben'];    
                  var user_zustand_angaben_arr=user_zustand_angaben;
                  
                  if(typeof user_zustand_angaben_baujahr == "undefined")   
                  {
                      user_zustand_angaben_arr['baujahr']=obj_null;
                  }
                  if(typeof user_zustand_angaben_energiepass == "undefined")
                  {
                      user_zustand_angaben_arr['energiepass']=obj_null;
                  }
                   if(typeof user_zustand_angaben_energiepass_gueltig_bis == "undefined")
                  {
                      user_zustand_angaben_arr['energiepass']['gueltig_bis']=obj_null;
                  }
                  if(typeof user_zustand_angaben_energiepass_endenergiebedarf == "undefined")
                  {
                      user_zustand_angaben_arr['energiepass']['endenergiebedarf']=obj_null;
                  }
                   if(typeof user_zustand_angaben_energiepass_primaerenergietraeger == "undefined")
                  {
                      user_zustand_angaben_arr['energiepass']['primaerenergietraeger']=obj_null;
                  }
                  if(typeof user_zustand_angaben_energiepass_wertklasse == "undefined")
                  {
                      user_zustand_angaben_arr['energiepass']['wertklasse']=obj_null;
                  } 
                   if(typeof user_zustand_angaben_user_defined_simplefield_epass_baujahr == "undefined")
                  {
                      user_zustand_angaben_arr['user_defined_simplefield']=obj_null;
                  }

                  var objektkategorie=JSON.stringify(user_objektkategorie_arr);
                  
                  var geo=JSON.stringify(user_geo_arr);
                 
                  var kontaktperson=JSON.stringify(jp['openimmo']['anbieter']['immobilie']['kontaktperson']).toString();  

                  var weitere_adresse=JSON.stringify([]);
                  var preise=JSON.stringify(jp['openimmo']['anbieter']['immobilie']['preise']).toString();

                  var bieterverfahren=null;
                  var versteigerung={}; 
                  var bieterverfahren=JSON.stringify(jp['openimmo']['anbieter']['immobilie']['bieterverfahren']).toString();
                  var versteigerung=JSON.stringify(jp['openimmo']['anbieter']['immobilie']['versteigerung']).toString();

                  var flaechen=JSON.stringify(user_flaechen_arr);

                  var ausstattung=JSON.stringify(jp['openimmo']['anbieter']['immobilie']['ausstattung']).toString();

                  var zustand_angaben=JSON.stringify(user_zustand_angaben_arr);

                  var bewertung=JSON.stringify(jp['openimmo']['anbieter']['immobilie']['bewertung']).toString();
                  var infrastruktur=JSON.stringify(jp['openimmo']['anbieter']['immobilie']['infrastruktur']).toString();
                      

                  var pre_freitexte=JSON.stringify(user_freitexte_arr).toString();
                  var freitexte=pre_freitexte.replace(/\\/g, '&nbsp;'); 
               
                  var anhaenge=JSON.stringify(user_anhaenge_arr);

                  var verwaltung_objekt=JSON.stringify(jp['openimmo']['anbieter']['immobilie']['verwaltung_objekt']).toString();

                  var verwaltung_techn=JSON.stringify(user_vertech_value_arr);

                  var update_time=new Date();
                  var top_directory=top;
                  var directory=my_dir;
                   

                  let date_ob = new Date();
                  let date = ("0" + date_ob.getDate()).slice(-2);

                  // current month
                  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

                  // current year
                  let year = date_ob.getFullYear();

                  // current hours
                  let hours = date_ob.getHours();

                  // current minutes
                  let minutes = date_ob.getMinutes();

                  // current seconds
                  let seconds = date_ob.getSeconds();

                  var created_at=year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

                
                  // anbieters table   
                  
                  var anbieternr=jp['openimmo']['anbieter']['anbieternr'];
                  var firma=jp['openimmo']['anbieter']['firma'];
                  var openimmo_anid=jp['openimmo']['anbieter']['openimmo_anid'];
                  var lizenzkennung="NULL";
                  var anhang="NULL";
                  var impressum="NULL";
                  var impressum_strukt="NULL";
                  
                 
                  // openimmos table
  
                  var art=jp['openimmo']['uebertragung']['art'];          
                  var umfang=jp['openimmo']['uebertragung']['umfang'];
                  var modus=jp['openimmo']['uebertragung']['modus'];
                  var version=jp['openimmo']['uebertragung']['version'];
                  var sendersoftware=jp['openimmo']['uebertragung']['sendersoftware'];
                  var senderversion=jp['openimmo']['uebertragung']['senderversion'];
                  var techn_email=jp['openimmo']['uebertragung']['techn_email']; 
                  var regi_id="NULL";
                  var timestamp=jp['openimmo']['uebertragung']['timestamp'];

                  var d=timestamp.split('T')[0];
                  var t=timestamp.match(/\d\d:\d\d:\d\d/)[0];
                  var date1=mydate.format(new Date((d)),'YYYY-MM-DD');
                  var timestamp1=date1 +' ' + t; 


                  // general fields

                  var user_defined_simplefield=JSON.stringify([]);
                  var user_defined_anyfield=JSON.stringify([]);
                  var user_defined_extend=JSON.stringify([]);  
                   
                  dbConn.query("INSERT INTO immobilies(openimmo_obid,objektkategorie,geo,kontaktperson,weitere_adresse,preise,bieterverfahren,versteigerung,flaechen,ausstattung,zustand_angaben,bewertung,infrastruktur,freitexte,anhaenge,verwaltung_objekt,verwaltung_techn,user_defined_simplefield,user_defined_anyfield,user_defined_extend,update_time,top_directory,directory,created_at,updated_at)VALUES('"+openimmo_obid+"','"+ objektkategorie +"','"+geo+"','"+kontaktperson+"','"+weitere_adresse+"','"+preise+"','"+bieterverfahren+"','"+versteigerung+"','"+flaechen+"','"+ausstattung+"','"+zustand_angaben+"','"+bewertung+"','"+infrastruktur+"','"+freitexte+"','"+anhaenge+"','"+verwaltung_objekt+"','"+verwaltung_techn+"','"+user_defined_simplefield+"','"+user_defined_anyfield+"','"+user_defined_extend+"','"+created_at+"','"+top_directory+"','"+directory+"','"+created_at+"','"+created_at+"')",(err,res)=>{
                      if(err) 
                        console.log(err);   
                      else
                        var immobilie_id=res.insertId;
                    dbConn.query("INSERT INTO anbieters(immobilie_id,anbieternr,firma,openimmo_anid,lizenzkennung,anhang,impressum,impressum_strukt,user_defined_anyfield,user_defined_simplefield,created_at,updated_at)VALUES('"+immobilie_id+"','"+anbieternr+"','"+firma+"','"+openimmo_anid+"','"+lizenzkennung+"','"+anhang+"','"+impressum+"','"+impressum_strukt+"','"+user_defined_anyfield+"','"+user_defined_simplefield+"','"+created_at+"','"+created_at+"')",(err,res1)=>{
                        if(err)
                              console.log(err);
                        else   
                          var anbieter_id=res1.insertId;
                        
                        dbConn.query("INSERT INTO openimmos(anbieter_id,art,umfang,modus,version,sendersoftware,senderversion,techn_email,regi_id,timestamp,user_defined_anyfield,user_defined_simplefield,created_at,updated_at)VALUES('"+anbieter_id+"','"+art+"','"+umfang+"','"+modus+"','"+version+"','"+sendersoftware+"','"+senderversion+"','"+techn_email+"','"+regi_id+"','"+timestamp1+"','"+user_defined_anyfield+"','"+user_defined_simplefield+"','"+created_at+"','"+created_at+"')",(err,res2)=>{
                          if(err)
                            console.log(err);
                          else
                          
                              console.log("inserted");
                              dbConn.query("INSERT INTO zip_files(filename,deleted_at,created_at,updated_at)VALUES('"+zipfilename+"','"+created_at+"','"+created_at+"','"+created_at+"')",(err,zip)=>{

                              });
                        });                   
                    }); 
                  });
       dir++;
      });
   });
}


//Add Property into db which is not available in db end 

 //Read Folder start    

function readFolder(path){ 
    return fs.readdirSync(path);
}

//Read Folder end

// Check and Get Zip which is available in db start

function checkFileExist(files){
 var sqlfound='select filename from zip_files where filename in(';
 for(let i = 0; i < files.length; i++){
    sqlfound = sqlfound + '"' + files[i] + '"';
    if(i != (files.length-1)){
      sqlfound = sqlfound + ",";
    }
 }         
 sqlfound = sqlfound + ")";
  return new Promise((resolve,reject)=>{
        dbConn.query(sqlfound,function(err,res){
          if(err){    
            console.log(err); 
          }else{
            resolve(res);
          }
        });
  });    
}

// Check and Get New Zip which is available in db end

// Hiteshree Custom method to display Import Api End
 
//Toggle Publish property
Immobilie.togglepublish = function(id){
  var date = new Date();
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0');
  var yyyy = date.getFullYear();
  let h = date.getHours();
  let m = date.getMinutes();
  let s = date.getSeconds();

  
  date = yyyy + ':' + mm + ':' + dd + ' ' + h+ ':' + m +':' + s;
  
  var sql = 'select *  from `immobilies` where id = '+id;
    dbConn.query(sql, function (err, result) {
      // if(err){
      //   res.send(err);
      // }else{
          var data =result[0].deleted_at;
        
          if(data !== null && data !== '0000-00-00 00:00:00'){
           var sql_up= 'update `immobilies` set deleted_at= "NULL" where id ='+id 
           dbConn.query(sql_up, function (err, result) {
            if(err){
              res.status(503).send(err);
            }else{
                // res.status(200).json({msg:"property unpublish successfully !"});
                console.log("property unpublish successfully !");
            }
            
          });
        }
        else{
          var sql_up_2= 'update `immobilies` set deleted_at="'+ date +'" where id ='+id 
          dbConn.query(sql_up_2, function (err, result) {
            if(err){
              res.status(503).send(err);
            }else{
              // res.status(200).json({msg:" property published successfully !"}); 
              console.log("property published successfully !");
            }
            
          });
          }

      // }
});
}

//Toggle Publish property

// Hiteshree Custom method to display Single Import Api Start

Immobilie.SingleimportProperty = function (myfile,result) {


  var rootfolders = readFolder('openimmo/');
  var files = [];     //Store All Files
  var exist_zip =[];  //Store Exists Zip names
  var new_zip =[];    //Store New zip names
  var xml_array =[];   //Store XML file list
  var xml_readdata =[]; //Store Result of XML to xml_readdata array
  var openimmo_obid_arr=[]; //Store openimmo_obid(read from xml file)
  var res1;

  files.push(myfile);
  

  var ress,makesubfolders;
          ress= checkFileExist(files);    // Check and get  Zip File already exists in db or not
          ress.then((data)=>{             // Return result of zip which is availale in db
            exist_zip=data;               // Add already available zip to exist_zip array
            var myarr=files;
            var d; 
         
            for (var i = 0; i < myarr.length; i++) {
              var f=false;
              var val=myarr[i];                                       
              for (var j = 0; j < exist_zip.length; j++) {
                  if(val == exist_zip[j].filename){             //Compare files of both array
                    f=true;
                    break;
                }
              }

              if(f==false){
                new_zip.push(val);       //Push Zip names to new_zip which is not available in db
              }
            }
          
            if(new_zip.length>0){       //If new_zip contains any one zip(>0)

                 var add_arr=[],del_arr=[];   //Add and Del Array to Store property which are to be added and deleted
                 
                 var make_zipfolders_xmlfiles=  make_zipfolder_xmlfile(rootfolders,new_zip);  //make zip folders and extract zip files
                
                 make_zipfolders_xmlfiles.then((data)=>{       
            
                      xml_array=data;                 //If result returns store data to xml_array 

                      setTimeout(()=>{                //Set time that executes read_xml and other code after specified time of extraction completion 

                          var readxml= read_xml(xml_array);   //To Read Xml Data
                          
                          readxml.then((data)=>{
                              xml_readdata=data;            //Store result of XML to xml_readdata array
                              
                              xml_readdata.forEach(xmlread_arr=>{
                                 
                                  const jp = JSON.parse(xmlread_arr);  
                                  var openimmo_obid=jp['openimmo']['anbieter']['immobilie']['verwaltung_techn']['openimmo_obid'];

                                  openimmo_obid_arr.push(openimmo_obid);    //push main openimmo into one array  
                              }); 

                              var check_openimmo_obid= db_check_openimmo_obid(openimmo_obid_arr);  //check openimmo_obid available in db or not
 
                              check_openimmo_obid.then((data)=>{        //If openimmo_obid is there then add and delete data
                    
                                  var delete_data = db_delete_data(data['del_arr']);    //To Delete data from db

                                  var add_data = db_add_data(xml_array,xml_readdata,new_zip);   //To add data into db
                                  
                                  var final_object={
                                      "exists_file":exist_zip,
                                      "database_updated_file":new_zip
                                  }                                   //Return FinalObject that shows list of exists file and updated file(Add & delete)

                                  result(null,final_object);  
                              });
                          }); 
                      },1000);
                });
            }
            else
            {
          
                var ext={
                    "exist_zip":exist_zip
                }                         //Returns only exists zip if noy added any newly zip
                result(null,ext);
          }
      });
 }

// Hiteshree Custom method to display Single Import Api End


// search property start

Immobilie.searchProperty = function(types_of_use,surface_min,price_max,room_min,types_of_region,center,lat,lon,object_id,types_of_object,radius,per_page,page,result){
  
  let sql="select immobilies.* from `immobilies` where";
  
  if(!types_of_use)     
    types_of_use =0;   

  if(types_of_use ==  0)
      sql=sql+"`objektkategorie` like '%WOHNEN%' and";
  else if(types_of_use == 1)
       sql=sql+"`objektkategorie` like '%GEWERBE%' and ";

  if(types_of_use!=2){
        if(!surface_min)
          surface_min=0;
        if(!price_max)
          price_max=0;
        if(!room_min)
          room_min=0;
        if(!types_of_region)
          types_of_region=null;
        if(types_of_region == 'region'){
            sql=sql+"`geo` like '%" +center + "%'";       
        }
        else if(types_of_region == 'city'){
            sql=sql+"`geo` like '%" +center+ "%'";
        }
        else          //pending search by street because of apply where condiiton of json_extract to get lat and lon for all properties
        {
            
            if(!lat)
              lat=0;
            if(!lon)
              lon=0;
            if(!radius)
              radius=0;
              if(radius==0){
                radius=1;
              }
              else if(radius < 6){
                radius=radius*1.5;
              }
        }      

        if(!types_of_object){
          types_of_object="all";
        }

        if(types_of_object != "all"){

        }

        if(price_max !=0 && price_max!=' '){

        }

        if(room_min!=0){
            // sql=sql+"and `anzahl_zimmer` >= "+room_min+"";
        }

        if(surface_min!=0){
            // sql=sql+"and `flaechen` >= "+surface_min+"";
        }

        if(types_of_region!='region' && types_of_region!='city' && lat && lan){

              sql=sql+" and ( 6371 * acos( cos( radians("+radius+") ) * cos( radians(`geo` like '%breitengrad%') ) * cos( radians(`geo` like '%laengengrad%') -radians("+radius+")) + sin( radians("+radius+") ) * sin( radians(`geo` like '%breitengrad%'))) <= "+radius+"";
              sql=sql+" and (111.045*haversine(`geo` like '%breitengrad%',`geo` like '%laengengrad%',"+lat+","+lon+") <=1)";
        }
        
        if(!per_page && !page){
              sql=sql+"and `immobilies`.`deleted_at` is null order by `id` desc";  
        }
        else
        {
              var offset = (per_page * (page - 1));
              sql=sql+"and `immobilies`.`deleted_at` is null order by `id` desc  limit "+per_page+" offset "+offset+"";
        }
        dbConn.query(sql,function(err,res){
          if(res)
          {
            result(null,res);     
          }
          else{

            result(null,err);
          }
       });
  }
  else
  { 
    if(object_id!=null){
      if(!per_page && !page){
          var sql_object="select immobilies.* from `immobilies` where `openimmo_obid` like '%" +object_id+ "%' and(`zustand_angaben` like '%VERKAUFT%' or `zustand_angaben` like '%OFFEN%') and `immobilies`.`deleted_at` is null order by `id` desc";
        }
        else
        {
          var offset = (per_page * (page - 1));
          var sql_object="select immobilies.*  from `immobilies` where `openimmo_obid` like '%" +object_id+ "%' and(`zustand_angaben` like '%VERKAUFT%' or `zustand_angaben` like '%OFFEN%') and `immobilies`.`deleted_at` is null order by `id` desc  limit "+per_page+" offset "+offset+"";
        }
      dbConn.query(sql_object,function(err,res){
          if(res)
          {
            result(null,res);
          }
          else{

            result(null,err);
          }
      });

    }
    else
    {
       var error = new Object();
       error['message'] = "Object Id Can't be empty!!";
       result(error,null);
    }
  }
}

// search property end

// Custom method to display all offen property start

Immobilie.getAllOffenProperty = function(per_page,page,id,result){


  let pid;
  let obj_tmp,obj_tmp1,obj_tmp2;
  let i;
    if(id < 10){
      pid = '0000'+id;
    } 

    else if(id< 100){
       pid = '000'+id;  
    }

    else if(id < 1000){
       pid = '00'+id;
    } 

    else if(id < 10000){
       pid = '0'+id;
    } 

      if(pid == "00004")
      { 
              var offset = (per_page * (page - 1));
              dbConn.query('SELECT *,`i`.`id` AS imm_id,`a`.`id` AS anb_id,`a`.`user_defined_anyfield` AS anb_user_defined_anyfield,`a`.`user_defined_simplefield` AS anb_user_defined_simplefield,`a`.`created_at` AS anb_created_at,`a`.`updated_at` AS anb_updated_at,`a`.`deleted_at` AS anb_deleted_at FROM immobilies i  left join anbieters a on a.immobilie_id = i.id where (a.anbieternr = ' + pid + ') and i.deleted_at is null order by i.id desc  limit '+per_page+' offset '+offset,async function (err,res){
              if(err){
                result(null,err); 
              } 
              else
              {  
                  result(null,res);  
              }
           });
      }         
      else  
      {
        var offset = (per_page * (page - 1));
        var sql="select *,`immobilies`.`id` AS imm_id,`anbieters`.`id` AS anb_id,`anbieters`.`user_defined_anyfield` AS anb_user_defined_anyfield,`anbieters`.`user_defined_simplefield` AS anb_user_defined_simplefield,`anbieters`.`created_at` AS anb_created_at,`anbieters`.`updated_at` AS anb_updated_at,`anbieters`.`deleted_at` AS anb_deleted_at from `immobilies`  left join `anbieters`  on `anbieters`.`immobilie_id` = `immobilies`.`id` where (`zustand_angaben` like '%VERKAUFT%' or `zustand_angaben` like '%OFFEN%') and (`anbieters`.`openimmo_anid` = "+pid+") and `immobilies`.`deleted_at` is null order by  `immobilies`.`id` desc limit "+per_page+" offset "+offset;
          dbConn.query(sql,(err,res1)=>{
              if(err){
                result(null,err); 
              } 
              else
              {
                result(null,res1); 
              }
              
          }); 
      }
}
// Custom method to display all offen property end

module.exports = Immobilie;