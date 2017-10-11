const request = require('request');


function getFunctionsList(gateway, connectionString, projectName, callback){

    try{

        //TODO: missing security on the gateway
        var functionsJson = {};

        const options = {
          url: `${gateway}/system/functions`,
          method: "GET",
          json: true
        };

        request(options, (err, response, body) => {
          if (err) return callback(err);
          if (response.statusCode !== 200) return callback(body || response.statusMessage);

          functionsJson[projectName] = [];
          //loop on all the funcitons
          for (var i = 0, len = body.length; i < len; i++) {
            var func = body[i];
            var returnFunc = {};
            returnFunc.FunctionArn = func.image;
            returnFunc.FunctionName = func.name;
            returnFunc.envProcess = returnFunc.envProcess;
            returnFunc.Trigger = `${gateway}/function/${func.name}`;
            //create an array of functions under the project
            functionsJson[projectName].push(returnFunc);
          }

          //console.log(response);
          callback(null, functionsJson);
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

// getFunctionsList('http://localhost:8080', config.connectionString, 'mylocal', function(err, data){
//   if(err){
//     console.log(err);
//   } else {
//     console.log(data);
//   }
//   process.exit(1);
// });






