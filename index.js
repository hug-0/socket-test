const express = require('express');
var app = express();
const path = require('path');
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(server);

// Illusion of message storage
var messages = [];

io.on('connection', function (socket) {
  
  // On connection
  socket.emit('connection', {
    messages: messages
  });
  
  socket.on('joined', function() {
    console.log('Someone connected.');
    socket.broadcast.emit('joined', {
      message: 'Someone has joined the chat.'
    });
  });
  
  // On message
  socket.on('message', function(msg) {
    console.log(msg);
    messages.push(msg);
    socket.broadcast.emit('message', {
      message: msg
    });
  });
  
  // On disconnect
  socket.on('disconnect', function(msg) {
    console.log('Someone disconnected.');
    socket.broadcast.emit('left', {
      message: "Someone left the chat."
    })
  });
  
  // Phone data
  socket.on('phone', function(data) {
    console.log('Phone connected.');
    socket.broadcast.emit('phone', {
      x: data.x,
      y: data.y,
      z: data.z
    });
  });
});

server.listen(port, function() {
  console.log('Server listening at %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));