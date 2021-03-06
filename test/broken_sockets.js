process.chdir(__dirname);
var path = process.env.TESTPATH || '../';

var chai = require("chai");
var expect = chai.expect;
var request = require('superagent');
var _ = require('underscore');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");

var api_url = require(path + 'configFactory').getConfig().api_url;

var config = require(path + 'configFactory').getConfig();
var socketServerAddress = config.socketConfig.serverAddress + ':' + config.socketConfig.serverPort;


var tokenUrl = api_url + "/token";

chai.should();
chai.use(sinonChai);
var appName = "ionic1";

var login = function (email, password, appName, callback) {
    request.post(tokenUrl)
        .type('form')
        .send({
            username: email,
            password: password,
            appname: appName,
            grant_type: "password"
        }).end(function (err, res) {
            // console.log(err);
            // console.log(res);
            callback(err, "bearer" + " " + res.body.access_token);
        });
};

var anonymousLogin = function (token, callback) {
    request.get(api_url + '/api/account/profile')
        .set('AnonymousToken', token)
        .end(function (err, res) {
            console.log(err);
            // console.log(res);
            callback(err, res);
        });
};

function sendEventToServer(sendData, callback) {
    request.post('http://localhost:9000/socket/emit')
        .send(sendData)
        .set('app', appName)
        .end(function (err, res) {

            if (!err) {
                console.log('yay got ' + JSON.stringify(res.body));
            } else {
                console.log('Oh no! error ' + err);
            }
            callback(err, res);
        })
};

var socket = require('socket.io-client')(socketServerAddress);

var socket2 = require('socket.io-client')(socketServerAddress);

describe("end-to-end-work one user", function () {
    this.timeout(300000);


    var spy1 = sinon.spy();

  before(function (done) {
        var eventName = "testMessage";

        socket.on('notAuthorized', function (data) {
            console.log('not authorized');
            throw new Error("fail");
        });

        socket.on(eventName, function (data) {
            console.log("Here", eventName);
            spy1();
            done();
        });

        socket.on('authorized', function () {
            console.log('authorized');
            sendEventToServer({"data": "test user itay", "eventName": eventName, "mode": "All"}, function(err){
                if (err){
                    throw new Error("fail sendEventToServer");
                }
            });

        });

      login("ygalbel@gmail.com", "bell1234", appName, function(err, token) {
          if (!err){
              socket.emit('login',
                    token,
                    '',
                    appName
              );            
          }
          else{
            throw new Error("fail login");
          }
      });

    })

    it("connect from one server send data to client", function (done) {
        spy1.should.have.been.called;
        done();
    });
});

describe("end-to-end-work two users", function () {
    it("all users get notification", function (done) {
        this.timeout(180000);

        var eventName = "testMessage";

        var messageCount = 0;

        messageArrived = function(){
            messageCount++;

            if(messageCount == 1){
                done();
            }
        }

        var token1 = '';
        var token2 = '';
        login("ygalbel@gmail.com", "bell1234", appName, function(err,token){
            console.log(err);
            token1 = token;

            login("ygalbel@gmail.com", "bell1234", appName, function(err,token) {
                console.log(err);
                token2 = token;

                    socket.emit('login',
                        token1,
                        'f0a0f62f-65ea-457e-93e8-ea7d21c07abf',
                        appName
                    );


                socket2.emit('login',
                    token2,
                    'f0a0f62f-65ea-457e-93e8-ea7d21c07abf',
                    appName
                );

                socket.on(eventName, messageArrived);
                socket2.on(eventName, messageArrived);

                request.post('http://localhost:9000/socket/emit')
                    .send({"data": "123", "eventName": eventName, "mode": "All"})
                    .set('app', appName)
                    .end(function (err, res) {
                        if (res.ok) {
                            console.log('yay got OK');
                        } else {
                            console.log('Oh no! error ' + res.text);
                        }
                        done();
                    })
            });

        })

    })
});

describe("user with anonymous token can get messages", function(){
    this.timeout(180000);

    var spy1 = sinon.spy();

    before(function (done) {
        var eventName = "testMessage3";

        socket.on('notAuthorized', function (data) {
            console.log('not authorized');
            throw new Error("fail");
        });

        socket.on(eventName, function (data) {
            console.log("Here", data);
            spy1();
            done();
 
        });

        socket.on('authorized', function () {
            sendEventToServer({"data": "test user itay", "eventName": eventName, "mode": "All"}, function(err, res){
                console.log(err);
                if (err){
                    throw new Error("fail sendEventToServer");
                }
            });
        });

        anonymousLogin('f0a0f62f-65ea-457e-93e8-ea7d21c07abf', function(err, token){
            if (!err){
                socket.emit('login',
                    null,
                    'f0a0f62f-65ea-457e-93e8-ea7d21c07abf',
                    appName
                );                
            }
            else{
                throw new Error("fail login");
            }
        });
    })

    it('message arrived', function(done){
        spy1.should.have.been.called;
        done();
        console.log('next anonymous test');
    })
});

describe("user with anonymous token can get messages by role", function(){
    this.timeout(300000);
    socket.connect();
    var spy1 = sinon.spy();

    before(function (done) {
        var eventName = "testMessage3";

        socket.on('notAuthorized', function (data) {
            console.log('not authorized');
            throw new Error("fail");
        });

        socket.on(eventName, function (data) {
            console.log("Here");
            spy1();
            done();
            socket.disconnect();
        });

        socket.on('authorized', function () {
            console.log('authorized');
            sendEventToServer({"data": "test user itay", "eventName": eventName, "mode": "Role", "Role" : "User"}, function(err, res){
                if (err){
                   throw new Error("fail sendEventToServer"); 
                }
                else {
                    spy1();
                    done();
                }
            });
        });

        anonymousLogin('f0a0f62f-65ea-457e-93e8-ea7d21c07abf', function(err, token){
            console.log('anonymousLogin', err);
            if (!err){
                socket.emit('login',
                    null,
                    'f0a0f62f-65ea-457e-93e8-ea7d21c07abf',
                    appName
                );                
            }
            else{
                throw new Error("fail login");
            }
        });


    })

    it('message arrived', function(done){
        spy1.should.have.been.called;
        done();
    })
});

//
//describe("send message to server", function(){
//
//  it('test All', function(done){
//    sendEventToServer({"data": "test all", "eventName": "action1", "mode": "All"});
//    done();
//  });
//
//  it('test user exists', function(done){
//    sendEventToServer({"data": "test user itay", "eventName": "action2", "mode": "Users", users:["itay@backand.com","dev1@backand.com"]});
//    done();
//  });
//
//  it('test user does not exists', function(done){
//    sendEventToServer({"data": "test user itay", "eventName": "action3", "mode": "Users", users:["itay111@backand.com","dev111@backand.com"]});
//    done();
//  });
//
//  it('Test Role True', function(done){
//    sendEventToServer({"data": "test Admin", "eventName": "action1", "mode": "Role", role:"Admin"});
//    done();
//  });
//
//  it('Test Role False', function(done){
//    sendEventToServer({"data": "test User", "eventName": "action1", "mode": "Role", role:"User"});
//    done();
//  });
//
//});
