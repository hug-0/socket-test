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

// Tell clients when someone disconnects
socket.on('left', function(msg) {
  $messages.append('<li>' + msg.message + '</li>');
});