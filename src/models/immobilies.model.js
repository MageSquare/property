'use strict';
const dbConn = require('../../config/db.config');
const fs = require('fs');
const extract = require('extract-zip');  //Module TO Extract Zip Files
const path = require('path');            //Module To Get Root Path
const xml2js = require('xml2js');        //Module To Convert Xml Data To JSON
const parser = new xml2js.Parser({ attrkey: "ATTR" });   

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

          var sql_query = 'select * from immobilies i left join anbieters a on a.immobilie_id = i.id where a.openimmo_anid in ('+prov_ids+') and i.deleted_at is null order by i.created_at desc, i.id desc';
          if(!per_page && curr_page){
            var sql =sql_query+' offset '+ offset +'';  
          }  
          else if(per_page && !curr_page){
            var sql =sql_query+' limit '+ per_page+' ';
          }
          
          else if(!per_page && !curr_page){
            var sql =sql_query;
          }
          else if(per_page && curr_page){
            var sql =sql_query+' limit '+ per_page +' offset '+ offset +' ';
          }

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
            
            var sql_query = "select * from immobilies i left join anbieters a on a.immobilie_id = i.id where json_unquote(json_extract(`zustand_angaben`, '$.verkaufstatus.stand')) = 'VERKAUFT' and a.openimmo_anid = "+pid+" and i.deleted_at is null order by i.created_at desc, i.id desc";
            if(!per_page && curr_page){
              var sql=sql_query+" offset "+ offset +"";
            }  
            else if(per_page && !curr_page){
              var sql=sql_query+" limit "+ per_page +" ";
            }
            
            else if(!per_page && !curr_page){
              var sql=sql_query;
            }
            else if(per_page && curr_page){
              var sql=sql_query+" limit "+ per_page +" offset "+ offset +" ";
            }

            dbConn.query(sql, function (err, data) {
                if (err) {
                    let error = new Object();
                    error['message']='Something went wrong!';
                    result(error, null);
                } else {

                  if(data.length>0){
                    result(null,data);
                  }
                  else{
                    let error = new Object();
                    error['message']='Data not found!';
                    result(error, null);
                  }
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
          var sql='select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where  `immobilies`.`deleted_at` is null order by `created_at` desc';
        else{
          var offset = (per_page * (page - 1));
          var sql='select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where  `immobilies`.`deleted_at` is null order by `created_at` desc  limit '+per_page+' offset '+offset;
          dbConn.query(sql,function (err, res) {
            if(err) 
              result(null,err);
            else{
               var total_count_q = "select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where  `immobilies`.`deleted_at` is null order by `created_at` desc";
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
      var new_array =[];
      var new_array1 =[];       
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

                 var add_arr=[],del_arr=[];   //Add and Del Array to Store propery which are to be added and deleted
                 
                 var make_zipfolders_xmlfiles=  make_zipfolder_xmlfile(rootfolders,new_zip);  //make zip folders and extract zip files
                
                 make_zipfolders_xmlfiles.then((data)=>{ 
            
                      new_array=data;                 //If result returns store data to new_array

                      setTimeout(()=>{                //Set time that executes read_xml and other code after specified time of extraction completion 

                          var readxml= read_xml(new_array);   //To Read Xml Data
                          readxml.then((data)=>{
                              new_array1=data;            //Store result of XML to new_array1

                              var check_openimmo_obid= db_check_openimmo_obid(new_array1);  //check openimmo_obid available in db or not

                              check_openimmo_obid.then((data)=>{        //If openimmo_obid is there then add and delete data
                    
                                  var delete_data = db_delete_data(data['del_arr']);    //To Delete data from db

                                  var add_data = db_add_data(new_array,new_array1,new_zip);   //To add data into db
                                  
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

function read_xml(new_array){
  
  var latest_xml =[];

  return new Promise((resolve,reject)=>{  
    var root=path.resolve("./");
    var path2 = root.replace(/\\/g, "/");  
    var dir="unzip/";  
 
    for(var i=0;i<new_array.length;i++){  //new_array contains total properties to be read
              
          var zip_folder=new_array[i].substring(0,new_array[i].length -4);  
          var zip_folder_proid=new_array[i].substring(0,5);
          var final=dir+zip_folder_proid+"/"+zip_folder+"/"+new_array[i];
          var finalpath=path2+"/"+final;
          let xml_string= fs.readFileSync(finalpath,'utf8');    //read xml file
         
          parser.parseString(xml_string,function(err, result){    //parse xml fle data to json
            try{
               if(err) {
                  console.log(err);
                }
                else {  
                  latest_xml.push(result);  
                }
            }
            catch(err){
                console.log(err);
            }
          });
        
       }
        resolve(latest_xml);
    });
}

//Read Data from xml file end

//Check openimmo_obid is available in db or not and based on that decide whether to add or delete property start

function db_check_openimmo_obid(new_array1){

  var myar=[];
  var add_arr =[];
  var del_arr =[];
  var flag=0;
  var obj;
  var add_len,new_array1_len;
  
  return new Promise((resolve,reject)=>{

    new_array1.forEach(new_arr=>{
        myar.push(new_arr.openimmo);    //push main openimmo into one array
    });
      

    myar.forEach(new_arr1=>{      //foreach openimmo's array
  
        var openimmo_obid=new_arr1.anbieter[0].immobilie[0].verwaltung_techn[0].openimmo_obid.toString();   //get openimmo_obid
  
         dbConn.query('SELECT * FROM immobilies i  where i.openimmo_obid like?','%'+ openimmo_obid + '%' ,async function(err,res){  //check if id is available in db or not
            if(err){
                console.log(err);  
            }
            else 
            {        
                if(typeof res[0]!="undefined")          //if result is not undefined
                {                                                //then
                    del_arr.push(openimmo_obid);           //push to delete array
                }                                                //otherwise
                    add_arr.push(openimmo_obid);           //push to add array
            }        
             
               add_len=add_arr.length;
               new_array1_len=new_array1.length;
            
                if(add_len==new_array1_len)
                {
                    obj={                                //resolve object when length of add and new_array is become same
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

function db_add_data(new_array,new_array1,new_zip){

  var myar=[];
    
   return new Promise((resolve,reject)=>{
      new_array1.forEach(new_arr=>{          
        myar.push(new_arr.openimmo);
      });
     
      var dir=0;
       myar.forEach(new_arr1=>{
                  
                  var my_dir=new_array[dir].substring(0,new_array[dir].length -4);
                  var top=new_array[dir].substring(0,5);

                  var zipfilename=new_zip[dir];
            
                  var openimmo_obid=new_arr1.anbieter[0].immobilie[0].verwaltung_techn[0].openimmo_obid.toString();

                  // immobilies table

                  // 1...freitexte field

                  var user_freitexte_objekttitel=JSON.stringify(new_arr1.anbieter[0].immobilie[0].freitexte[0].objekttitel);
                  var user_freitexte_ausstatt_beschr=JSON.stringify(new_arr1.anbieter[0].immobilie[0].freitexte[0].ausstatt_beschr.toString());
                  var user_freitexte_lage=JSON.stringify(new_arr1.anbieter[0].immobilie[0].freitexte[0].lage.toString());
                  var freitexte=JSON.stringify(new_arr1.anbieter[0].immobilie[0].freitexte);
                  var user_freitexte_arr=JSON.parse(freitexte);
                  var arr="[]";

                  if(typeof user_freitexte_objekttitel == "undefined")
                  {
                      user_freitexte_arr[0].objekttitel=arr;
                  }
                  if(typeof user_freitexte_ausstatt_beschr == "undefined")
                  {
                      user_freitexte_arr[0].ausstatt_beschr=arr;
                  }
                  if(typeof user_freitexte_lage == "undefined")
                  {
                      user_freitexte_arr[0].lage=arr;  
                  }
                

                  // 2...geo field

                  var user_geo_ort=JSON.stringify(new_arr1.anbieter[0].immobilie[0].geo[0].ort.toString());
                  var user_geo_plz=JSON.stringify(new_arr1.anbieter[0].immobilie[0].geo[0].plz.toString());
                  var geo=JSON.stringify(new_arr1.anbieter[0].immobilie[0].geo[0]);
                  var user_geo_arr=JSON.parse(geo);

                  if(typeof user_geo_ort == "undefined")
                  {
                      user_geo_arr[0].ort=arr;
                  }
                  if(typeof user_geo_plz == "undefined")
                  {
                      user_geo_arr[0].plz=arr;
                  }

                  
                  // 3...flaechen field

                  var user_flaechen_wohnflaeche=JSON.stringify(new_arr1.anbieter[0].immobilie[0].flaechen[0].wohnflaeche);
                  var user_flaechen_anzahl_zimmer=JSON.stringify(new_arr1.anbieter[0].immobilie[0].flaechen[0].anzahl_zimmer);
                  var user_flaechen_grundstuecksflaeche=JSON.stringify(new_arr1.anbieter[0].immobilie[0].flaechen[0].grundstuecksflaeche);
                  var flaechen=JSON.stringify(new_arr1.anbieter[0].immobilie[0].flaechen[0]);
                  var user_flaechen_arr=JSON.parse(flaechen);

                  if(typeof user_flaechen_wohnflaeche == "undefined")
                  {
                      user_flaechen_arr.wohnflaeche=arr;
                  }
                  if(typeof user_flaechen_anzahl_zimmer == "undefined")
                  {
                      user_flaechen_arr.anzahl_zimmer=arr;
                  }
                  if(typeof user_flaechen_grundstuecksflaeche == "undefined")
                  {
                      user_flaechen_arr.grundstuecksflaeche=arr;
                  }
                  
                  // 4...verwaltung_techn field

                  var user_vertech_value=JSON.stringify(new_arr1.anbieter[0].immobilie[0].verwaltung_techn[0]);
                  var user_vertech_value_arr=JSON.parse(user_vertech_value);

                  if(typeof user_vertech_value == "undefined")
                  {
                      user_vertech_value_arr.verwaltung_techn=arr;
                  }
                  
                  // 5...anhaenge field

                  var user_anhaenge_anhang=JSON.stringify(new_arr1.anbieter[0].immobilie[0].anhaenge[0].anhaenge);
                  var user_anhaenge_daten_pfad=JSON.stringify(new_arr1.anbieter[0].immobilie[0].anhaenge[0].pfad);
                  var user_anhaenge=JSON.stringify(new_arr1.anbieter[0].immobilie[0].anhaenge);
                  var user_anhaenge_arr=JSON.parse(user_anhaenge);

                  if(typeof user_anhaenge_anhang == "undefined")
                  {
                      user_anhaenge_arr.anhaenge=arr;
                  }
                  if(typeof user_anhaenge_daten_pfad == "undefined")
                  {
                      user_anhaenge_arr.pfad=arr;
                  }
                  
                  // 6...objektkategorie field

                  var user_objektkategorie_nutzungsart=JSON.stringify(new_arr1.anbieter[0].immobilie[0].objektkategorie[0].nutzungsart);
                  var user_objektkategorie_objektart=JSON.stringify(new_arr1.anbieter[0].immobilie[0].objektkategorie[0].objektart);
                  var user_objektkategorie=JSON.stringify(new_arr1.anbieter[0].immobilie[0].objektkategorie[0]);
                  var user_objektkategorie_arr=JSON.parse(user_objektkategorie);
          
                  if(typeof user_objektkategorie_nutzungsart == "undefined")
                  {
                      user_objektkategorie_arr.nutzungsart=arr;
                  }
                  if(typeof user_objektkategorie_objektart == "undefined")
                  {
                      user_objektkategorie_arr.objektart=arr;
                  }
                  

                  // 7...zustand_angaben field

                  var user_zustand_angaben_baujahr=JSON.stringify(new_arr1.anbieter[0].immobilie[0].zustand_angaben[0].baujahr);
                  var user_zustand_angaben_energiepass=JSON.stringify(new_arr1.anbieter[0].immobilie[0].zustand_angaben[0].energiepass);
                  var user_zustand_angaben_energiepass_gueltig_bis=JSON.stringify(new_arr1.anbieter[0].immobilie[0].zustand_angaben[0].energiepass[0].gueltig_bis);
                  var user_zustand_angaben_energiepass_endenergiebedarf=JSON.stringify(new_arr1.anbieter[0].immobilie[0].zustand_angaben[0].energiepass[0].endenergiebedarf);
                  var user_zustand_angaben_energiepass_primaerenergietraeger=JSON.stringify(new_arr1.anbieter[0].immobilie[0].zustand_angaben[0].energiepass[0].primaerenergietraeger);
                  var user_zustand_angaben_energiepass_wertklasse=JSON.stringify(new_arr1.anbieter[0].immobilie[0].zustand_angaben[0].energiepass[0].wertklasse);
                  var user_zustand_angaben_user_defined_simplefield_epass_baujahr=JSON.stringify(new_arr1.anbieter[0].immobilie[0].zustand_angaben[0].user_defined_simplefield);
                  var user_zustand_angaben=JSON.stringify(new_arr1.anbieter[0].immobilie[0].zustand_angaben);    
                  var user_zustand_angaben_arr=JSON.parse(user_zustand_angaben);
                  
                  if(typeof user_zustand_angaben_baujahr == "undefined")   
                  {
                      user_zustand_angaben_arr.baujahr=arr;
                  }
                  if(typeof user_zustand_angaben_energiepass == "undefined")
                  {
                      user_zustand_angaben_arr.energiepass=arr;
                  }
                   if(typeof user_zustand_angaben_energiepass_gueltig_bis == "undefined")
                  {
                      user_zustand_angaben_arr[0].energiepass.gueltig_bis=arr;
                  }
                  if(typeof user_zustand_angaben_energiepass_endenergiebedarf == "undefined")
                  {
                      user_zustand_angaben_arr[0].energiepass.endenergiebedarf=arr;
                  }
                   if(typeof user_zustand_angaben_energiepass_primaerenergietraeger == "undefined")
                  {
                      user_zustand_angaben_arr[0].energiepass.primaerenergietraeger=arr;
                  }
                  if(typeof user_zustand_angaben_energiepass_wertklasse == "undefined")
                  {
                      user_zustand_angaben_arr[0].energiepass.wertklasse=arr;
                  }
                   if(typeof user_zustand_angaben_user_defined_simplefield_epass_baujahr == "undefined")
                  {
                      user_zustand_angaben_arr[0].user_defined_simplefield=arr;
                  }

                  var objektkategorie=JSON.stringify(user_objektkategorie_arr);
                  var geo=JSON.stringify(user_geo_arr);
                  var kontaktperson=JSON.stringify(new_arr1.anbieter[0].immobilie[0].kontaktperson);
                  var weitere_adresse=JSON.stringify([]);
                  var preise=JSON.stringify(new_arr1.anbieter[0].immobilie[0].preise);
                  var bieterverfahren=null;
                  var versteigerung={};
                  var bieterverfahren=JSON.stringify(new_arr1.anbieter[0].immobilie[0].bieterverfahren);
                  var versteigerung=JSON.stringify(new_arr1.anbieter[0].immobilie[0].versteigerung);
                  var flaechen=JSON.stringify(user_flaechen_arr);
                  var ausstattung=JSON.stringify(new_arr1.anbieter[0].immobilie[0].ausstattung);
                  var zustand_angaben=JSON.stringify(user_zustand_angaben_arr);
                  var bewertung=JSON.stringify(new_arr1.anbieter[0].immobilie[0].bewertung);
                  var infrastruktur=JSON.stringify(new_arr1.anbieter[0].immobilie[0].infrastruktur);
                  var freitexte=JSON.stringify(user_freitexte_arr[0]);
                  var anhaenge=JSON.stringify(user_anhaenge_arr);
                  var verwaltung_objekt=JSON.stringify(new_arr1.anbieter[0].immobilie[0].verwaltung_objekt);
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
                  
                  var anbieternr=JSON.stringify(new_arr1.anbieter[0].anbieternr.toString());
                  var firma=JSON.stringify(new_arr1.anbieter[0].firma.toString());
                  var openimmo_anid=JSON.stringify(new_arr1.anbieter[0].openimmo_anid.toString());
                  var lizenzkennung=JSON.stringify(new_arr1.anbieter[0].toString());
                  var anhang=JSON.stringify("NULL");
                  var impressum=JSON.stringify("NULL");
                  var impressum_strukt=JSON.stringify("NULL");
                  
                 
                  // openimmos table

                  var art=JSON.stringify(new_arr1.uebertragung[0].ATTR.art.toString());
                  var umfang=JSON.stringify(new_arr1.uebertragung[0].ATTR.umfang.toString());
                  var modus=JSON.stringify(new_arr1.uebertragung[0].ATTR.modus.toString());
                  var version=JSON.stringify(new_arr1.uebertragung[0].ATTR.version.toString());
                  var sendersoftware=JSON.stringify(new_arr1.uebertragung[0].ATTR.sendersoftware.toString());
                  var senderversion=JSON.stringify(new_arr1.uebertragung[0].ATTR.senderversion.toString());
                  var techn_email=JSON.stringify(new_arr1.uebertragung[0].ATTR.techn_email.toString());
                  var regi_id=JSON.stringify("NULL");
                  var timestamp=JSON.stringify(new_arr1.uebertragung[0].ATTR.timestamp.toString());

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


// Hiteshree Custom method to display Single Import Api Start

Immobilie.SingleimportProperty = function (myfile,result) {

  var rootfolders = readFolder('openimmo/');
  var files = [];     //Store All Files 
  var exist_zip =[];  //Store Exists Zip names
  var new_zip =[];    //Store New zip names
  var new_array =[];
  var new_array1 =[];        
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

             var add_arr=[],del_arr=[];   //Add and Del Array to Store propery which are to be added and deleted
             console.log("309",new_zip);
             var make_zipfolders_xmlfiles=  make_zipfolder_xmlfile(rootfolders,new_zip);  //make zip folders and extract zip files
                   
             make_zipfolders_xmlfiles.then((data)=>{ 
        
                  new_array=data;                 //If result returns store data to new_array

                  setTimeout(()=>{                //Set time that executes read_xml and other code after specified time of extraction completion 

                      var readxml= read_xml(new_array);   //To Read Xml Data
                      // console.log("323",readxml);
                      if(readxml.flag==0){
                        result(null,readxml.error);    
                      }
                      else 
                      {  
                          readxml.then((data)=>{           
                              new_array1=data;            //Store result of XML to new_array1

                              var check_openimmo_obid= db_check_openimmo_obid(new_array1);  //check openimmo_obid available in db or not

                              if(check_openimmo_obid.flag==0){
                                result(null,check_openimmo_obid.error);
                              }
                              else    
                              {
                                  check_openimmo_obid.then((data)=>{        //If openimmo_obid is there then add and delete data 
                        
                                      var delete_data = db_delete_data(data['del_arr']);    //To Delete data from db

                                      if(delete_data.flag==0){
                                          result(null,delete_data.error)
                                      }
                                      else
                                      {      
                                        
                                        var add_data = db_add_data(new_array,new_array1,new_zip);   //To add data into db

                                        if(add_data.flag==0){
                                          result(null,add_data.error);
                                        }
                                        else
                                        {
                                          var final_object={
                                              "exists_file":exist_zip,
                                              "database_updated_file":new_zip
                                          }   
                                           result(null,final_object);  //Return FinalObject that shows list of exists file and updated file(Add & delete)                                          
                                        }

                                      }
                                        
                                  });
                              }
                        }); 
                      } 
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
  
  let sql="select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where";
  
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
              sql=sql+"and `immobilies`.`deleted_at` is null order by `created_at` desc";  
        }
        else
        {
              var offset = (per_page * (page - 1));
              sql=sql+"and `immobilies`.`deleted_at` is null order by `created_at` desc  limit "+per_page+" offset "+offset+"";
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
          var sql_object="select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where `openimmo_obid` like '%" +object_id+ "%' and(`zustand_angaben` like '%VERKAUFT%' or `zustand_angaben` like '%OFFEN%') and `immobilies`.`deleted_at` is null order by `created_at` desc";
        }
        else
        {
          var offset = (per_page * (page - 1));
          var sql_object="select immobilies.*, headers.logo from `immobilies` left join `headers` on `headers`.`provider_id` =`immobilies`.`top_directory` where `openimmo_obid` like '%" +object_id+ "%' and(`zustand_angaben` like '%VERKAUFT%' or `zustand_angaben` like '%OFFEN%') and `immobilies`.`deleted_at` is null order by `created_at` desc  limit "+per_page+" offset "+offset+"";
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

module.exports = Immobilie;