var httpd = require('http').createServer(handler);
var io = require('dynamic.io')().listen(httpd);
var fs = require('fs');


httpd.listen(4000);

function handler(req, res) {

  console.log(req.url);
  
  fs.readFile(__dirname + req.url,
    function(err, data) {
      if (err) {
       res.writeHead(500);
       return res.end('Error loading index.html');
      }

      res.writeHead(200);
      res.end(data);
    }
  );
  
}

// io.setupNamespace('', function(nsp) {
// 	// Set retirement to set up the number of milliseconds this
// 	// namespace should hang around after its last socket disconnects.
// 	// Default is 10 seconds.
// 	nsp.retirement = Math.max(nsp.retirement, 30 * 1000);
// 	// Set up the namespace as normal in socket.io.
// 	nsp.on('connect', function(socket) {
// 		console.log('got a socket connect on', nsp.fullname());
		
// 		socket.on('disconnect', function() {
// 			console.log('somebody disconnected from', nsp.fullname());
// 		});

// 		socket.on('clientMessage', function(data) {
// 		    console.log("clientMessage", nsp.fullname(), data);
// 		    nsp.emit('serverMessage',  'You said: ' + data.content);
// 		    nsp.broadcast.emit('serverMessage', { sender: socket.id, content: data.content });
// 		});


// 	});

// 	// Return false from the setupNamespace callback if
// 	// you want to ignore this namespace.
// 	return true;
// });


// Specify host in options if you want to handle virtual hosts.
// Then only connections with a Host header matching host will
// map to "/".  (The default is /.*/, which maps all hosts to '/';
// host can be a string or a RegExp).  All other host namespaces
// will get a prefix of "//otherhost.com".  The Namespace method
// nsp.fullname() gets the fully qualified namespace name, while
// and nsp.name still // returns just '/' (or '/mynamespace')
// without the host; nsp.host returns the host.

// io = require('dynamic.io')(
// 	//{ host: 'myhost.com'}
// 	);

// By the way, you can override gethost if you need to normalize.
io.getHost = function(conn) {
  console.log("getHost");
  return conn.request.headers.host.replace(/^www\./, '');
}

// Namespaces other than '/' are created and deleted dynamically.
// You can register namespaces with specific names, or with
// the '*' wildcard, and your setup function will be called whenever
// that namespace is created (or re-created after expiration).
io.setupNamespace('*', function(nsp) {
  // Set retirement to set up the number of milliseconds this
  // namespace should hang around after its last socket disconnects.
  // Default is 10 seconds.
  nsp.retirement = Math.max(nsp.retirement, 30 * 1000);
  // Set up the namespace as normal in socket.io.
  nsp.on('connect', function(socket) {
    console.log('got a socket connect on', nsp.fullname());
    socket.on('disconnect', function() {
      console.log('somebody disconnected from', nsp.fullname());
    });
  });
  // Return false from the setupNamespace callback if
  // you want to ignore this namespace.
  return true;
});

// // Just use the server as normal.
// io.listen(4000);