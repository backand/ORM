'use strict';
var AzureFunctions = require('azure-functions');
var async = require('async');

function getFunctionsList(subscriptionId, appId, tenant, password, callback){

    try{

        var azFunctions = new AzureFunctions('','',
            {
                subscriptionId: subscriptionId,
                clientId: appId,
                clientSecret: password,
                domain: tenant
            }
        );

        //get all apps out the subscription and out of it all the functions
        var options = {};
        options.filter = "resourceType eq 'Microsoft.Web/sites'";
        azFunctions._rmClient.apiVersion = '2017-06-01';
        
        azFunctions._rmClient.resources.list(options, function(err, result) {
            if (err){
                callback(err);
                console.log(err);
            } 
            //console.log(result);
            var functionsJson = {};
            async.each(result, function(app, callback) {
                    
                var resourceGroupName = app.id.match(/resourceGroups\/(.)*providers/)[0].replace('resourceGroups/','').replace('/providers','');
                var functionAppName = app.name;

                var requestUrl = azFunctions._rmClient.baseUri + '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}';
                requestUrl = requestUrl.replace('{subscriptionId}', subscriptionId);
                requestUrl = requestUrl.replace('{resourceGroupName}', resourceGroupName);
                requestUrl = requestUrl + '/providers/Microsoft.Web/sites/' + functionAppName + '/functions';

                azFunctions._rmClient.apiVersion = '2016-08-01';
                azFunctions._performRequest(requestUrl)
                .then(function(functions){
                    var data = functions.value;
                    var functionListing = Object.keys(data).map((key) => {
                        var returnBody = {};
                        returnBody.FunctionName = data[key].properties.name;
                        returnBody.FunctionArn = data[key].id;
                        returnBody.AuthLevel = data[key].properties.config.bindings[0].authLevel || 'Admin';
                        returnBody.Trigger = data[key].properties.config.bindings[0].type;
                        returnBody.AppName = functionAppName;
                        returnBody.Key = ""; //todo: get the keys of the app
                        returnBody.TestData = data[key].properties.test_data;
                        return returnBody
                    });
                    //return each app with the array of functions
                    if(functionListing && functionListing.length > 0){
                        functionsJson[functionAppName] = functionListing;
                    }
                    callback();
                },function(err) {
                    //console.log(err);
                    callback();
                })
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

function _getAppSecretKey(){
    // const requestUrl = `https://${functionAppName}${config.functionsAdminApiPath}${functionName}`;

    // const options = {
    //   host: config.functionAppDomain,
    //   method: 'post',
    //   body: eventData,
    //   url: requestUrl,
    //   json: true,
    //   headers: {
    //     'x-functions-key': functionsAdminKey,
    //     Accept: 'application/json,*/*'
    //   }
    // };

    // return new BbPromise((resolve, reject) => {
    //   request(options, (err, res) => {
    //     if (err) {
    //       reject(err);
    //     }
    //     resolve(res);
    //   });
    // });
}

module.exports.getFunctionsList = getFunctionsList;

// var config = {
//         "subscriptionId":"393c86bb-df7c-4e2b-b65c-5d49868640bf",
//         "appId": "2714aa2d-8319-49dc-93aa-1d5ead69cd79",
//         "password": "16dd4e6d-3eb5-4e36-b41e-4b4eee257b3e",
//         "tenant": "fca70269-df49-4f51-81a4-bdcbc7da439e"
//     };
    
// getFunctionsList(config.subscriptionId, config.appId, config.tenant, config.password, function(err, data){
//     console.log(data);
//     process.exit(1);
// });
