Architecture
============
We use [Socket.io](http://socket.io).

Installation
============

Install Node.js modules:

    npm install

Install AngularJS app:

    cd angular-socket-app
    bower install

Architecture
============

**Chat Page**

An input box to send messages and a display of received messages. To send a message click return.

Not an AngularJS app. Intended just for playing with sockets.

**AngularJS App**

In folder `angular-socket-app`.
Derived from `angular-seed` project [https://github.com/angular/angular-seed].

Two views and a toolbar.

Each view, when active, show the sequence of messages received from a web socket while it is active.

Connection to socket is in service `socket` in file `app.js`.

Include `socket.io` in `index.html`.

The AngularJS app authenticates itself to the socket server with a username. Currently the username is hardwired in the service. Authentication is through a `login` event.

The app receives messages on actions in Backand through an `action` event.

**socketio_server.js**

Has three separate functions:

1. Web server for AngularJS - because of browser security restrictions, we to serve pages using Socket.io from a web server. 
2. Chat server - receives `clientMessage`, broadcasts `serverMessage`. Used just by chat page.
3. Forwarder of actions in Backand to AngularJS app. Receives `login` events from AngularJS. Receives `action` events when an action was executed in backand. Sends `action` event to app, based on the authentication during login.

**action_server.js**

An `http` server. Calls are routed like in `schema_server` using `journey`. Receives a POST `action` call from Backand. Sends an `action` event to the socketio server.

**call flow**

On login:

AngularJS app => socketio server

On action:

Backand => action server => socketio server => AngularJS app

**authentication** 

We need to complete the real authentication details from Backand to action server to socketio server.

Operation
=========

1. Run servers:

    node socketio_server.js
    node action_server.js

2. Open AngularJS application in browser:

    http://localhost:4000/angular-socket-app/app/index.html

3. Open chat page in browser (open at least two tabs to test it):

    http://localhost:4000/socketio_client.html

Backand Action
==============

Use the url to your action server, 

/* globals
  $http - service for AJAX calls - $http({method:"GET",url:CONSTS.apiUrl + "/1/objects/yourObject" , headers: {"Authorization":userProfile.token}});
  CONSTS - CONSTS.apiUrl for Backands API URL
*/
'use strict';
function backandCallback(userInput, dbRow, parameters, userProfile) {
    // write your code here

    var response = $http(
        {
            method:"POST",
            url: "http://653ea4e3.ngrok.io/action", 
            headers: {
                "Content-Type" : "application/json",
            },
            data: {
                username: "joe", 
                content: { "a" : 1, "b" : 2 }
            }

        }
    );
    console.log(response);
    return {};
}

To Test on Your Desktop
=======================
Use [ngrok](https://ngrok.com) to be able to access your servers from Backand. 

ngrok gives your desktop a world reachable url. 

At the command line do:

    ./ngrok http 9000

To be able to access our action server from Backand, copy the url and use it in the Backand action. Each time you use ngrok, a different url is created.

To Install Node.js on Linux
===========================
    ./install_gcc.sh
    ./install_node_npm.sh



