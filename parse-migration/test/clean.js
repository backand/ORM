var Cleaner = require('./cleaner');
var StatusBl = require('../StatusBL');
var connectionRetreiver = require('../../get_connection_info');

function clean(){
    var statusBl = new StatusBl(workerId);

    statusBl.connect()
        .then(statusBl.getNextJob)
        .then(function(job){
            connectionRetreiver.getConnectionInfoSimple(job.appToken, job.appName, function (err, connectionInfo) {
                var cleaner = new Cleaner(connectionInfo);
                cleaner.clean(job.parseSchema,function(){
                    console.error("failed to clean");
                }, function(){
                    console.info("clean started");
                },
                function(){
                    console.info("clean finished");
                })
            });


        })
}


clean();