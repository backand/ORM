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

        if(payload.userInput){
          queryString = Object.keys(payload.userInput)
                            .map((key) => `${key}=${payload.userInput[key]}`)
                            .join('&');
        }

        if(method.toLowerCase() == "post"){
          bodyJSON = payload.parameters;
          bodyJSON.userProfile = payload.userProfile;
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
//userInput = query string, dbRow = ignored, parameters = POST data, userProfile = POST data.userProfile
// var payload = {
//   userInput: {"name":"param1"},
//   dbRow: {},
//   parameters: {"postdata":"just another JSON"},
//   userProfile: {"username":"itay@backand.io","role":"Admin"}
// }

// invokeFunction('HttpTriggerJS1', 'backand-f2', 'function', 'httpTrigger', 'GET', '', payload, function(err, data){
//     if(err){
//       console.log(err);
//     } else {
//       console.log(data);
//     }    
//     process.exit(1);
// });