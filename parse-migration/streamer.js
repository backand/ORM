/**
 * Created by Dell on 2/2/2016.
 */

var fs = require('fs')
    , JSONStream = require('JSONStream')
    , es = require('event-stream')
    , async = require('async');
function Streamer() {
}

Streamer.prototype = (function () {
    // Private code here
    function getDataInner(datalink, fileName, onData, finishCallback, startId) {
        var q = async.queue(function (task, callback) {
            console.log(task.val.objectId);
            onData(task.val, function(){
                console.log('call finish data ' +  task.val.objectId);
                callback();
            });
        }, 1);

        q.drain = function() {
            console.log('all items have been processed');
            isFinsihed = true;
            finishCallback();
        }

        var canRead = false;
        var jsonIsEmpty = true;
        if (!startId) {
            canRead = true;
        }

        var path = datalink + fileName;

        try {
            fs.accessSync(path, fs.R_OK);
        }
        catch(err){
            finishCallback(err);
            return;
        }

        var a = fs.createReadStream(path)
            .on('end',function(){
                // assign a callback
                if(jsonIsEmpty){
                    console.log("finish without any json for " + path);
                    finishCallback();
                }
            } )
            .pipe(JSONStream.parse(['results',true]))
            .pipe(es.mapSync(function (data, cb) {
                if (!canRead && data && data.objectId === startId) {
                    canRead = true;
                }

                console.log('start data ' + data.objectId);

                if (canRead) {
                    jsonIsEmpty = false;
                    q.push({'val' : data});
                }
            }));

       /* a.end()*/
    }

    return {

        constructor: Streamer,

        getDataFromSpecificObjectId: function (datalink, fileName, objectId, onData, finishCallback) {
            getDataInner(datalink, fileName, onData, finishCallback, objectId);
        },

        getData: function (datalink, fileName, onData, finishCallback) {
            getDataInner(datalink, fileName, onData, finishCallback);
        }

    };
})();

module.exports = Streamer;