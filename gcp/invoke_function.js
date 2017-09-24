'use strict';
const request = require('request');
const BbPromise = require('bluebird');

function invokeFunction(triggerUrl, method, payload, callback){

  try{

    if (triggerUrl != '' && triggerUrl != null) {
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
          url: `${triggerUrl}?${queryString}`,
          method: method,
          json: true
        };
        if(method.toLowerCase() == "post"){
          options.body = bodyJSON;
        }

        request(options, (err, response, body) => {
          if (err) return callback(err);
          if (response.statusCode !== 200) return callback(body || response.statusMessage);

          var resObject = {
            StatusCode: response.statusCode,
            Payload: body
          }
          callback(null, resObject);
        });
      });
    } else {
      callback(`This function doesn't have external trigger URL`);
    }
  } catch(e){
    callback(e);
  }

}

module.exports.invokeFunction = invokeFunction;
//GET and POST data comes as parameters, userProfile = POST data.userProfile
// var payload = {
//   "message":"param1",
//   "postdata":"just another JSON",
//   userProfile: {"username":"itay@backand.io","role":"Admin"}
// }

// //https://us-central1-functions-179710.cloudfunctions.net/function2
// //https://us-central1-functions-179710.cloudfunctions.net/helloWorld

// invokeFunction('https://us-central1-functions-179710.cloudfunctions.net/function2', 'POST', payload, function(err, data){
//     if(err){
//       console.log(err);
//     } else {
//       console.log(data);
//     }    
//     process.exit(1);
// });