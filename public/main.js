// Variables
var $chat = $('.chat');
var $messages = $('.messages');
var $input = $('.input');

// SocketIO
var socket = io();
var connected = false;

// Send message and emit 'message'
function sendMessage() {
  var msg = $input.val();
  if (msg && connected) {
    $input.val('');
    $messages.append('<li>' + msg + '</li>');
    socket.emit('message', msg);
  }
}

// Attach listener to Submit button
$('.submitMessage').click(function() {
  sendMessage();
});

// Render any messages from conversation stored on server upon connection
socket.on('connection', function(data) {
  connected = true;
  data.messages.forEach(function(message) {
    $messages.append('<li>' + message + '</li>');
  });
  socket.emit('joined');
});

// Tell clients when someone connects
socket.on('joined', function(msg) {
  $messages.append('<li>' + msg.message + '</li>');
})

// Add message to chat
socket.on('message', function(msg) {
  $messages.append('<li>' + msg.message + '</li>');
});

// Phone data
if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', function(data) {
    var acceleration = data.acceleration;
    socket.emit('phone', acceleration);
  });
}

socket.on('phone', function(data) {
  $('#x').text('X: ' + Math.round(data.x, 2));
  $('#y').text('Y: ' + Math.round(data.y, 2));
  $('#z').text('Z: ' + Math.round(data.z, 2));
});

// Tell clients when someone disconnects
socket.on('left', function(msg) {
  $messages.append('<li>' + msg.message + '</li>');
});