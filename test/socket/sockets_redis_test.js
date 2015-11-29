var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var request = require('superagent');
var _ = require('underscore');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var redisBl = require("../../web_sockets/redis_bl");

var redisConfig = require('./../../config').redis;

var redisPort = redisConfig.port;
var redisHostname = redisConfig.hostname;
var option = redisConfig.option;
var redis = require('redis');
var redisInterface = redis.createClient(redisPort, redisHostname, option);



var bl = new redisBl.BusinessLogic(redisInterface);
chai.should();
chai.use(sinonChai);

var login = function (email, password, appName, callback) {
    request.post(tokenUrl)
        .type('form')
        .send({
            username: email,
            password: password,
            appname: appName,
            grant_type: "password"
        }).end(function (err, res) {
            callback(err, res.body.access_token);
        });
};


describe("redis insert", function () {
    this.timeout(30000);
    // clean data
    before(function (done) {
        bl.cleanUp(done);
    })

    it("after insert data exist in Redis", function (done) {
        bl.saveUser('appName', 'aaa', 'username', 'admin', function (err, res) {
            bl.getAllUsers('appName', function (err, data) {
                console.log(data);
                expect(data).not.to.be.null;
                expect(data[0].username).to.equal("username");
                expect(data[0].role).to.equal("admin");
                expect(data[0].socketId).to.equal("aaa");
                assert.lengthOf(data, 1);
                done();
            })
        });
    })

    it('second user is added and not delete first', function (done) {
        bl.saveUser('appName', 'bbb', 'username2', 'user', function (err, res) {
            bl.getAllUsers('appName', function (err, data) {
                console.log(data);
                expect(data).not.to.be.undefined;
                assert.lengthOf(data, 2);
                expect(data[0].username).to.equal("username");
                expect(data[1].username).to.equal("username2");
                done();
            })
        });
    });

    it('can fetch by role', function (done) {
        bl.getAllUsersByRole('appName', "user", function (err, data) {
            expect(data).not.to.be.null;
            assert.lengthOf(data, 1);
            expect(data[0].username).to.equal("username2");
            bl.getAllUsersByRole('appName', "admin", function (err, data2) {
                expect(data2).not.to.be.null;
                assert.lengthOf(data2, 1);
                expect(data2[0].username).to.equal("username");
                done();
            });

        });
    })

    it('can fetch by user list all', function(done){
        bl.getUserByList('appName', ["username", "username2"], function(err,data){
            expect(data).not.to.be.null;
            assert.lengthOf(data, 2);
            expect(data[0].username).to.equal("username");
            expect(data[1].username).to.equal("username2");
            done();
        })
    })

    it('can fetch by user list only second', function(done){
        bl.getUserByList('appName', ["username2"], function(err,data){
            expect(data).not.to.be.null;
            assert.lengthOf(data, 1);
            expect(data[0].username).to.equal("username2");
            done();
        })
    })

    it('can be deleted after disconnect', function(done){
        bl.removeSocket('aaa', function(){
            bl.getAllUsers('appName', function (err, data) {
                assert.lengthOf(data, 1);
                done();

            })
        })
    })

    it("can't be deleted twice", function(){

        // try to remove again, socketId we delete before
        bl.removeSocket('aaa', function(){
            bl.getAllUsers('appName', function (err, data) {
                assert.lengthOf(data, 1);
                done();

            })
        })
    })
});
