var chai = require("chai");
var expect = chai.expect;
var request = require('superagent');
var _ = require('underscore');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");

var api_url = require('../../config').api_url;
var tokenUrl = api_url + "/token";

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

var socket = require('socket.io-client')('http://localhost:4000');
var socket2 = require('socket.io-client')('http://localhost:4000');

function sendEventToServer(sendData) {
  request.post('http://localhost:9000/socket/emit')
      .send(sendData)
      .set('app', 'noterious')
      .end(function (err, res) {
        if (res.ok) {
          console.log('yay got ' + JSON.stringify(res.body));
        } else {
          console.log('Oh no! error ' + res.text);
        }

      })
};

describe("end-to-end-work one user", function () {
  var spy1 = sinon.spy();

  before(function (done) {
        var eventName = "testMessage";

        socket.on('notAuthorized', function (data) {
            console.log('not authorized');
            throw new Error("fail");
        });

        socket.on(eventName, function (data) {
            console.log("Here");
            spy1();
            done();
        });

        socket.on('authorized', function () {
            sendEventToServer(eventName);
        });

        socket.emit('login',
            'bearer lKCa9WTAtJh82ozu_o1EZVC3Mqk6_nxQVNoxq73WycRBBiqm0RIW8IUCfDe12xKE-02jX5CcEJB0Tbtne3Meiw17GwW5otXXOZlxX-jiOMhL5pCpmnQziwwFGAy5_lf2hETmlxkf47KbU9dC7P0kZuEuIAkAO0MSKBweJUghfp6ZLwNppFBhvyMe7JjHvY5hbD39he_kQaOG7cRmD8jJ9J_lUjwGhJDJlnt0HJqFLGTiBCnxFxfPc0NH1N02I735',
            'f0a0f62f-65ea-457e-93e8-ea7d21c07abf',
            'ionic1'
        );
    })

    it("connect from one server send data to client", function (done) {
        spy1.should.have.been.called;
        done();
    });
});

describe("end-to-end-work two users", function () {
    it("all users get notification", function (done) {
        this.timeout(5000);

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
        login("ygalbel@gmail.com", "bell1234", "ionic1", function(err,token){
            token1 = token;

            login("ygalbel@gmail.com", "bell1234", "ionic1", function(err,token) {
                token2 = token;

                socket.emit('login',
                    token1,
                    'f0a0f62f-65ea-457e-93e8-ea7d21c07abf',
                    'ionic1'
                );

                socket2.emit('login',
                    token2,
                    'f0a0f62f-65ea-457e-93e8-ea7d21c07abf',
                    'ionic1'
                );

                socket.on(eventName, messageArrived);
                socket2.on(eventName, messageArrived);

                request.post('http://localhost:9000/socket/emit')
                    .send({"data": "123", "eventName": eventName, "mode" : "All"})
                    .set('app', 'ionic1')
                    .end(function (err, res) {
                        if (res.ok) {
                            console.log('yay got ' + JSON.stringify(res.body));
                        } else {
                            console.log('Oh no! error ' + res.text);
                        }

                    })

            });
        })

    })
});

describe("send message to server", function(){

  it('test All', function(done){
    sendEventToServer({"data": "test all", "eventName": "action1", "mode": "All"});
    done();
  });

  it('test user exists', function(done){
    sendEventToServer({"data": "test user itay", "eventName": "action2", "mode": "Users", users:["itay@backand.com","dev1@backand.com"]});
    done();
  });

  it('test user does not exists', function(done){
    sendEventToServer({"data": "test user itay", "eventName": "action3", "mode": "Users", users:["itay111@backand.com","dev111@backand.com"]});
    done();
  });

  it('Test Role True', function(done){
    sendEventToServer({"data": "test Admin", "eventName": "action1", "mode": "Role", role:"Admin"});
    done();
  });

  it('Test Role False', function(done){
    sendEventToServer({"data": "test User", "eventName": "action1", "mode": "Role", role:"User"});
    done();
  });

});