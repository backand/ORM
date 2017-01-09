Preparation
===========
1. Redis should be running. 
2. Config files should direct the API, Socket, and Redis to QA server

PM2
===
Invoke in this order:

1. schema_server.js 
2. socketio_server.js

Wait few minutes

3. test/stress-test-socket-server.js


Wait 10 minutes. Look at number of concurrent processess running 

    node worker.js

This number is set at the top of stress-test-socket-server.js, 

    var numWorkers = 200;

So it should be as specified in the file.

4. test/test_emit.js
Testing emit continously with no delay
    