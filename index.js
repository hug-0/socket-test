const express = require('express');
var app = express();
const path = require('path');
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(server);

io.on('connection', function (socket) {
  
  // On connection
  socket.emit('connection', {
    data: "Connection success."
  });
  
  socket.on('joined', function() {
    console.log('Someone connected.');
    socket.broadcast.emit('joined', {
      data: 'Someone has accessed the site.'
    });
  });
  
  // On disconnect
  socket.on('disconnect', function(data) {
    console.log('Someone disconnected.');
    socket.broadcast.emit('left', {
      data: "Someone left the site."
    });
  });
  
  // Phone data
  socket.on('phone', function(data) {
    socket.broadcast.emit('phone', {
      accelerometer: {
        x: data.accelerometer.x,
        y: data.accelerometer.y,
        z: data.accelerometer.z
      },
      gyro: {
        alpha: data.gyro.alpha,
        beta: data.gyro.beta,
        gamma: data.gyro.gamma
      },
      interval: data.interval
    });
  });
});

server.listen(port, function() {
  console.log('Server listening at %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));