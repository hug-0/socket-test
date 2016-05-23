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
    var acceleration = data.accelerationIncludingGravity;
    var gyro = data.rotationRate;
    var d = {
      accelerometer: acceleration,
      gyro: gyro
    }
    socket.emit('phone', d);
  });
}

socket.on('phone', function(data) {
  $('#x').text('X: ' + Math.round(data.accelerometer.x * 100)/100);
  $('#y').text('Y: ' + Math.round(data.accelerometer.y * 100)/100);
  $('#z').text('Z: ' + Math.round(data.accelerometer.z * 100)/100);
  
  $('#a').text('Alpha: ' + Math.round(data.gyro.alpha * 100)/100);
  $('#b').text('Beta: ' + Math.round(data.gyro.beta * 100)/100);
  $('#g').text('Gamma: ' + Math.round(data.gyro.gamma * 100)/100);
});

// Tell clients when someone disconnects
socket.on('left', function(msg) {
  $messages.append('<li>' + msg.message + '</li>');
});