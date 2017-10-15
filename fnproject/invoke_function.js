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
        // if(method.toLowerCase() == "get" && payload){
        //   queryString = Object.keys(payload)
        //                     .map((key) => {return (key != 'userProfile') ? `${key}=${payload[key]}`: ''})
        //                     .join('&');
        // }

        if(method.toLowerCase() == "post"){
          bodyJSON = payload;
        }
      }

      new BbPromise((resolve, reject) => {
        const options = {
          url: `${triggerUrl}?${queryString}`,
          method: method
        };
        if(method.toLowerCase() == "post"){
          options.body = bodyJSON;
          options.json = true;
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
//   "url":"www.backand.com",
//   userProfile: {"username":"itay@backand.io","role":"Admin"}
// }
// //GET - http://localhost:8080/r/helloapp/
// //POST - http://localhost:8080/r/myapp/get_rank
// invokeFunction('http://localhost:8080/r/myapp/get_rank', 'GET', payload, function(err, data){
//     if(err){
//       console.log(err);
//     } else {
//       console.log(data);
//     }    
//     process.exit(1);
// });