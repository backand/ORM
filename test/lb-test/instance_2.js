var io = require('socket.io').listen(4001);

io.sockets.on('connection', function (socket) {
  socket.on('clientMessage', function(content) {
    console.log('clientMessage', content);
  socket.emit('serverMessage', 'two ' + content);
  });
});