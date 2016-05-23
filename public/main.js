// Variables
var $chat = $('.chat');
var $messages = $('.messages');
var $input = $('.input');

// SocketIO
var socket = io();
var connected = false;

// Bar Variables
var ctx, startingData, chart, latestLabel;
var accData = [];
function initChart() {
  ctx = document.getElementById("acc-chart").getContext("2d");
  startingData = {
    labels: [1,2,3,4,5,6,7],
    datasets: [
      {
        backgroundColor: "rgba(220,220,220,0.2)",
        borderColor: "rgba(220,220,220,1)",
        pointBackgroundColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        label: "X-acceleration",
        data: [1,1,1,1,1,1,1]
      },
      {
        backgroundColor: "rgba(151,187,205,0.2)",
        borderColor: "rgba(151,187,205,1)",
        pointBackgroundColor: "rgba(151,187,205,1)",
        pointStrokeColor: "#fff",
        label: "Y-acceleration",
        data: [1,1,1,1,1,1,1]
      },
      {
        backgroundColor: "rgba(100,187,125,0.2)",
        borderColor: "rgba(123,55,205,1)",
        pointBackgroundColor: "rgba(123,55,205,1)",
        pointStrokeColor: "#fff",
        label: "Z-acceleration",
        data: [1,1,1,1,1,1,1]
      }
    ]
  };
  latestLabel = startingData.labels[6];
  chart = new Chart(ctx, {
    type: 'line',
    data: startingData,
    options: {
      animationSteps: 15
    }
  });
  console.log(chart);
}
initChart();

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
  // Acc data
  $('#x').text('X: ' + Math.round(data.accelerometer.x * 100)/100);
  $('#y').text('Y: ' + Math.round(data.accelerometer.y * 100)/100);
  $('#z').text('Z: ' + Math.round(data.accelerometer.z * 100)/100);
  // Gyro data
  $('#a').text('Alpha: ' + Math.round(data.gyro.alpha * 100)/100);
  $('#b').text('Beta: ' + Math.round(data.gyro.beta * 100)/100);
  $('#g').text('Gamma: ' + Math.round(data.gyro.gamma * 100)/100);
  
  // Remove old data and add new data
  chart.data.datasets[0].data.shift();
  chart.data.datasets[1].data.shift();
  chart.data.datasets[2].data.shift();
  chart.data.datasets[0].data.push(data.accelerometer.x);
  chart.data.datasets[1].data.push(data.accelerometer.y);
  chart.data.datasets[2].data.push(data.accelerometer.z);
  chart.update();
});

// Tell clients when someone disconnects
socket.on('left', function(msg) {
  $messages.append('<li>' + msg.message + '</li>');
});