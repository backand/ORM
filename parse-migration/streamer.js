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
        var path = datalink + fileName;

        var current = this;

        current.path = path;
        current.finishCallback = finishCallback;
        current.jsonIsEmpty = true;
        current.onData = onData;
        current.firstTimeFinish = true;
        current.q = async.queue(function (task, callback) {
            var objectId = task.val ?  task.val.objectId : undefined;

            var currentCallback = function(){
                callback();
                return;
            }

            // handle case of empty file
            if(task.val) {
                console.log(task.val.objectId);
                current.jsonIsEmpty = false;
                task.onData(task.val, function () {
                    currentCallback();
                    return;
                });
            }else{
                currentCallback();
                return;
            }
        }, 1);

        current.q.drain = function() {
            current.q.drain = function(){};
            console.log('all items have been processed ' + current.path);
            current.firstTimeFinish = false;
            current.finishCallback();
            return;
        }
        current.fileExist = false;
        current.canRead = false;

        if (!startId) {
            current.canRead = true;
        }

        try {
            fs.accessSync(path, fs.R_OK);
            current.fileExist = true;
        }
        catch(err){
            console.log('error in streamer ' , err);
            console.log(current.finishCallback)
            current.firstTimeFinish = false;
            current.finishCallback(err);
            return;
        }

        if(!current.fileExist){
            console.log('nope');
            return;
        }

        console.log("start read " + current.path);
        fs.createReadStream(current.path)
            .on('close',function(){
                console.log('finish '  + current.path);
                current.q.push({'val' : undefined});
                return;
                // assign a callback
                /*if(current.jsonIsEmpty && current.firstTimeFinish){
                    current.firstTimeFinish = false;
                    console.log("finish without any json for " + current.path);
                    current.finishCallback();
                    return;
                }*/
            } )
            .pipe(JSONStream.parse(['results',true]))
            .pipe(es.mapSync(function (data, cb) {
                if (!current.canRead && data && data.objectId === startId) {
                    current.canRead = true;
                }

                if (current.canRead) {
                    current.jsonIsEmpty = false;
                    current.q.push({'val' : data, 'onData' : current.onData});
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