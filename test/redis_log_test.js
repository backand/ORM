/**
 * Created by backand on 3/27/16.
 */

var async = require('async');
var chai = require("chai");
var expect = chai.expect;

var logEntry = 'log_api';
var RedisDataSource = require('../logger-reply/sources/redisDataSource');
var config = require('../configFactory').getConfig();
var Logger = require('../logging/log_with_redis');
const util = require('util');
var logger = new Logger(config.socketConfig.serverAddress + ":" + config.socketConfig.serverPort);


var message = {
    "Source": "WebApi#",
    "ID": "testtrans03",
    "ApplicationName": "localhost:4110",
    "Username": "relly@backand.com",
    "MachineName": "DELL-PC",
    "Time": "3/27/2016 5:57:20 PM",
    "Controller": "",
    "Action": "GET",
    "MethodName": "testtrans01: ",
    "LogType": "3",
    "ExceptionMessage": "",
    "Trace": "",
    "FreeText": "http://localhost:4110/1/table/dictionary/items/?deep=true&withSystemTokens=true&crud=update",
    "Guid": "9a195edc-2235-4593-b259-60e38e2b3572",
    "ClientIP": "::1",
    "ClientInfo": "origin=http://localhost:3001; host=localhost:4110; referer=http://localhost:3001/; user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0; keys=ALL_HTTP,ALL_RAW,APPL_MD_PATH,APPL_PHYSICAL_PATH,AUTH_TYPE,AUTH_USER,AUTH_PASSWORD,LOGON_USER,REMOTE_USER,CERT_COOKIE,CERT_FLAGS,CERT_ISSUER,CERT_KEYSIZE,CERT_SECRETKEYSIZE,CERT_SERIALNUMBER,CERT_SERVER_ISSUER,CERT_SERVER_SUBJECT,CERT_SUBJECT,CONTENT_LENGTH,CONTENT_TYPE,GATEWAY_INTERFACE,HTTPS,HTTPS_KEYSIZE,HTTPS_SECRETKEYSIZE,HTTPS_SERVER_ISSUER,HTTPS_SERVER_SUBJECT,INSTANCE_ID,INSTANCE_META_PATH,LOCAL_ADDR,PATH_INFO,PATH_TRANSLATED,QUERY_STRING,REMOTE_ADDR,REMOTE_HOST,REMOTE_PORT,REQUEST_METHOD,SCRIPT_NAME,SERVER_NAME,SERVER_PORT,SERVER_PORT_SECURE,SERVER_PROTOCOL,SERVER_SOFTWARE,URL,HTTP_CONNECTION,HTTP_ACCEPT,HTTP_ACCEPT_ENCODING,HTTP_ACCEPT_LANGUAGE,HTTP_AUTHORIZATION,HTTP_HOST,HTTP_REFERER,HTTP_USER_AGENT,HTTP_APPNAME,HTTP_ORIGIN forwarded=",
    "Refferer": "http://localhost:3001/",
    "Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0",
    "Languages": "en-US,en;q=0.5"
};

var redisDataSource = new RedisDataSource();

describe('insert-scan-redis', function(){
    before(function(done){

        async.series([

            function(callback) {
                redisDataSource.delWildcard('WebApi_*', function(err, data){
                    callback(null, 'clean');
                });       
            },

            function(callback) {               
                async.timesSeries(1000, function(n, next) {
                    message.Source = 'WebApi' + n;
                    redisDataSource.insertEvent('WebApi_' + n, message, function(err, result){
                        next(err, result);
                    });
                }, function(err, a) {
                    callback(null, 'insert');
                });
            }

        ],
        
        function(err, results) {
            done();
        });

        
    });

    it("scan all", function(done){
        var a = [];
        redisDataSource.scan(
            function(data){
                a.push(data);
            },
            function(err){
                expect(err).to.be.undefined;
                expect(a.length).to.equal(1000);
                done();
            }
        );
    });

    after(function(done){
        redisDataSource.delWildcard('WebApi_*', function(err, data){
            done();
        });  
    });


});


describe('sorted sets', function(){

    before(function(done){

        async.series([

            function(callback) {
                redisDataSource.delWildcard('sorted-set', function(err, data){
                    callback(null, 'clean');
                });    
            },

            function(callback) {               
                async.timesSeries(1000, function(n, next) {
                    message.Source = 'WebApi_' + n;
                    redisDataSource.addEventToSortedSet('sorted-set', n, message, function(err, result){
                        next(err, result);
                    });
                }, function(err, a) {
                    callback(null, 'insert');
                });
            }

        ],
        
        function(err, results) {
            done();
        });

        
    });


    it("filter", function(done){
        redisDataSource.filterSortedSet('sorted-set', 10, 20, 3, 1, function(err, data){
            expect(err).to.be.null;
            expect(data.length).to.be.equal(1);
            expect(data[0].Source).to.be.equal('WebApi_13');
            done();
        });
    });

    after(function(done){
        redisDataSource.delWildcard('sorted-set', function(err, data){
            done();
        });  
    });

});

describe.only('exceptions log', function(){

    before(function(done){
        // 1. Make call to the logger with type 3
        // 2. Another two like that
        // 3. Another call to the logger with type 1
        // 4. Wait 1 minute
        // 5. Call get log exception expect 1 item
        async.series([

            function(callback) {
                redisDataSource.delWildcard(logEntry, function(err, data){
                    callback(null, 'clean-log-api');
                });    
            },

            function(callback) {
                redisDataSource.delWildcard('test-redis-appender', function(err, data){
                    callback(null, 'clean-app');
                });    
            },

            function(callback) { 
                console.log('insert regular');
                async.timesSeries(50, function(n, next) {
                    var req = {
                        headers: {
                            ID: 'test-redis-appender'
                        }                
                    };             
                    logger.logFields(false, req, "regular", "schema server", "transform", 'test-regular');
                    next(null, true);
                }, function(err, a) {
                    callback(null, 'insert regular');
                });
            },

            function(callback) { 
                console.log('insert exception');
                async.timesSeries(51, function(n, next) {
                    var req = {
                        headers: {
                            ID: 'test-redis-appender'
                        }                
                    };             
                    logger.logFields(false, req, "exception", "schema server", "transform", 'test-exception');            
                    next(null, true);
                }, function(err, a) {
                    callback(null, 'insert exception');
                });

            }

        ],
        
        function(err, results) {
            console.log(err, results);
            done();
        });
    });

    it("fetch type 1 only", function(done){
        this.timeout(200 * 000);
        setTimeout(function(){
            console.log('occurred');
            redisDataSource.filterSortedSet('test-redis-appender', 0, Date.now(), 0, 10000, function(err, data) {
                console.log(err);
                console.log(data);
                console.log(typeof err);
                expect(err).to.be.null;
                expect(data.length).to.be.equal(51);
                expect(
                    _.every(data, function(d) { 
                        return d.parse.ExceptionMessage == 'test-exception';
                    })
                ).to.be.true;
                done();
            });
        }, 100 * 1000); 
    });

    after(function(done){

        async.series([

            function(callback) {
                redisDataSource.delWildcard(logEntry, function(err, data){
                    callback(null, 'clean-log-api');
                });    
            },

            function(callback) {
                redisDataSource.delWildcard('test-redis-appender', function(err, data){
                    callback(null, 'clean-app');
                });    
            }

        ],
        
        function(err, results) {
            done();
        }); 
    });

});



