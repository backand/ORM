var socketEmitUrl = 'http://localhost:9000/socket/emit';
var async = require('async');
var request = require('request');

var appName = 'stress';



var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'app': appName,
};

async.forever(
    function(next) {
        // next is suitable for passing to things that need a callback(err [, whatever]);
        // it will result in this function being called again.
        var data = {
            data: Math.random(),
            'eventName': 'items_updated',
            'mode': 'All'
        };
        
        request(
            {
                url: socketEmitUrl,
                headers: headers,
                method: 'POST',
                json: data
            },

            function (error, response, body) {
                console.log(error);
                console.log(body);
                next();
            }
        );
    },
    function(err) {
        // if next is called with a value in its first parameter, it will appear
        // in here as 'err', and execution will stop.
        process.exit(err);
    }
);
    