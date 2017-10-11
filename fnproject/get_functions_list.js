'use strict';
const request = require('request');
const async = require('async');

function getFunctionsList(gateway, connectionString, callback){

    try{

        //TODO: missing security on the gateway
        var functionsJson = {};

        var options = {
          url: `${gateway}/v1/apps`,
          method: "GET",
          json: true
        };

        request(options, (err, response, body) => {
          if (err) return callback(err);
          if (response.statusCode !== 200) return callback(body || response.statusMessage);

          functionsJson = {};
          //loop on all the funcitons
          async.each(body.apps, function(app, callback) {
            
            options = {
              url: `${gateway}/v1/apps/${app.name}/routes`,
              method: "GET",
              json: true
            };
            request(options, (err, response, body) => {
              if (err) return callback(err);
              if (response.statusCode !== 200) return callback(body || response.statusMessage);

              functionsJson[app.name] = [];
              for (var i = 0, len = body.routes.length; i < len; i++) {
                var func = body.routes[i];
                var returnFunc = {};
                //use the route as the function name, for root use the rootname
                var funName = func.path.replace(/\//g, '');
                returnFunc.FunctionName = (funName === '') ? 'root' : funName;

                returnFunc.FunctionArn = func.image;
                returnFunc.envProcess = returnFunc.config;
                returnFunc.Trigger = `${gateway}/r/${func.app_name}${func.path}`;
                //create an array of functions under the project
                functionsJson[app.name].push(returnFunc);
              }
              callback();
            });

          }, function(err) {
              if( err ) {
                  // One of the iterations produced an error.
                  // All processing will now stop.
                  callback(err);
              } else {
                  callback(null, functionsJson);
              }
          })
        });
    }
    catch(err){
        callback(err);
    }
}

module.exports.getFunctionsList = getFunctionsList;

// var config = {
//   "connectionString": "",
// };

// getFunctionsList('http://localhost:8080', config.connectionString, function(err, data){
//   if(err){
//     console.log(err);
//   } else {
//     console.log(data);
//   }
//   process.exit(1);
// });






