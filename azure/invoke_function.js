'use strict';
const BbPromise = require('bluebird');
const request = require('request');

function invokeFunction(name, appName, authLevel, trigger, method, key, payload, callback){

  try{

    var config = {
      functionAppApiPath: '/api/',
      functionAppDomain: '.azurewebsites.net',
    };

    if (trigger === 'httpTrigger') {
      let queryString = '';
      let bodyJSON = {};

      if (payload) {
        if (typeof payload === 'string') {
          try {
            payload = JSON.parse(payload);
          }
          catch (error) {
            callback('The specified input data isn\'t a valid JSON string.');
          }
        }

        if(method.toLowerCase() == "get" && payload){
          queryString = Object.keys(payload)
                            .map((key) => {return (key != 'userProfile') ? `${key}=${payload[key]}`: ''})
                            .join('&');
        }

        if(method.toLowerCase() == "post"){
          bodyJSON = payload;
        }
      }

      new BbPromise((resolve, reject) => {
        const options = {
          url: `https://${appName}${config.functionAppDomain}${config.functionAppApiPath + name}?${queryString}`,
          method: method,
          body: bodyJSON,
          json: true,
        };

        request(options, (err, response, body) => {
          if (err) return callback(err);
          if (response.statusCode !== 200) return callback(body || response.statusMessage);
          callback(null, body);
        });
      });
    } else {
      callback(`Currently ${trigger} is not supported`);
    }
  } catch(e){
    callback(e);
  }

}

module.exports.invokeFunction = invokeFunction;
//GET and POST data comes as parameters, userProfile = POST data.userProfile
// var payload = {
//   "name":"param1",
//   "postdata":"just another JSON",
//   userProfile: {"username":"itay@backand.io","role":"Admin"}
// }

// invokeFunction('HttpTriggerJS1', 'backand-f3', 'function', 'httpTrigger', 'POST', '', payload, function(err, data){
//     if(err){
//       console.log(err);
//     } else {
//       console.log(data);
//     }    
//     process.exit(1);
// });