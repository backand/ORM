/**
 * Created by Dell on 2/10/2016.
 */
var Cleaner = require('../cleaner');
var Migrator = require('../../migrator');
var StatusBl = require('../../statusBl');
function runFullTest(testConnection, testSchema, appName, directory, done) {
    var cleaner = new Cleaner(testConnection);
    var migrator = new Migrator();
    var strSchema = JSON.stringify(testSchema);
    // perform database cleanup to initiate all the tables. only needed in the test
    cleaner.clean(testSchema.results, function (error) {
            console.log(error);
        }, function () {

        }, function () {
            var statusBl = new StatusBl();
            statusBl.connect().then(function () {
                migrator.runTest(appName, testConnection, directory,
                    strSchema, statusBl, function () {
                        //logger.info('finishedCallback');
                        console.log('finish')
                        done();
                    })
            })
        }
    );
}
describe('simple case test', function(){
    this.timeout(1000 * 240);
    it('can run migrator for case 1', function(done){
        var testSchema = require('./01/schema.json');
        var testConnection = require('./01/connection.json');
        var directory = "./test/integration/01/data/";
        var appName = "aaa";
        runFullTest(testConnection, testSchema, appName, directory, done);
    })

 /*   it('can run migrator for case 2', function(done){
        var testSchema = require('./schema.json');
        var testConnection = require('./connection.json');
        var directory = "./test/data/";
        var appName = "aaa";
        runFullTest(testConnection, testSchema, appName, directory, done);
    })*/
})

