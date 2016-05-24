// Variables
var $chat = $('.chat');
var $messages = $('.messages');
var $input = $('.input');

// Random comment

// SocketIO
var socket = io();
var connected = false;

// Bar Variables
var ctx1, startingAccData, accChart, latestAccLabel;
var ctx2, startingGyroData, gyroChart, latestGyroLabel;
initAccChart();
initGyroChart();

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
  window.addEventListener("devicemotion", function(e) {
    console.log(e.acceleration.x);
  });
});

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
      gyro: gyro,
      interval: data.interval
    };
    socket.emit('phone', d);
  }, false);
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
  accChart.data.datasets[0].data.shift();
  accChart.data.datasets[1].data.shift();
  accChart.data.datasets[2].data.shift();
  accChart.data.datasets[0].data.push(data.accelerometer.x);
  accChart.data.datasets[1].data.push(data.accelerometer.y);
  accChart.data.datasets[2].data.push(data.accelerometer.z);
  accChart.update();
  
  gyroChart.data.datasets[0].data.shift();
  gyroChart.data.datasets[1].data.shift();
  gyroChart.data.datasets[2].data.shift();
  gyroChart.data.datasets[0].data.push(data.gyro.alpha);
  gyroChart.data.datasets[1].data.push(data.gyro.beta);
  gyroChart.data.datasets[2].data.push(data.gyro.gamma);
  gyroChart.update();
});

// Tell clients when someone disconnects
socket.on('left', function(msg) {
  $messages.append('<li>' + msg.message + '</li>');
});

// Graph stuff
function initAccChart() {
  ctx1 = document.getElementById("acc-chart").getContext("2d");
  startingAccData = {
    labels: [1,2,3,4,5,6,7],
    datasets: [
      {
        backgroundColor: "rgba(234,108,108,0.2)",
        borderColor: "rgba(234,108,108,1)",
        pointBackgroundColor: "rgba(234,108,108,1)",
        pointStrokeColor: "#fff",
        label: "X-acceleration",
        data: [1,1,1,1,1,1,1]
      },
      {
        backgroundColor: "rgba(68,183,132,0.2)",
        borderColor: "rgba(68,183,132,1)",
        pointBackgroundColor: "rgba(68,183,132,1)",
        pointStrokeColor: "#fff",
        label: "Y-acceleration",
        data: [1,1,1,1,1,1,1]
      },
      {
        backgroundColor: "rgba(107,152,207,0.2)",
        borderColor: "rgba(107,152,207,1)",
        pointBackgroundColor: "rgba(107,152,207,1)",
        pointStrokeColor: "#fff",
        label: "Z-acceleration",
        data: [1,1,1,1,1,1,1]
      }
    ]
  };
  latestAccLabel = startingAccData.labels[6];
  accChart = new Chart(ctx1, {
    type: 'line',
    data: startingAccData,
    options: {
      animationSteps: 15
    }
  });
}
function initGyroChart() {
  ctx2 = document.getElementById("gyro-chart").getContext("2d");
  startingGyroData = {
    labels: [1,2,3,4,5,6,7],
    datasets: [
      {
        backgroundColor: "rgba(234,108,108,0.2)",
        borderColor: "rgba(234,108,108,1)",
        pointBackgroundColor: "rgba(234,108,108,1)",
        pointStrokeColor: "#fff",
        label: "Alpha",
        data: [1,1,1,1,1,1,1]
      },
      {
        backgroundColor: "rgba(68,183,132,0.2)",
        borderColor: "rgba(68,183,132,1)",
        pointBackgroundColor: "rgba(68,183,132,1)",
        pointStrokeColor: "#fff",
        label: "Beta",
        data: [1,1,1,1,1,1,1]
      },
      {
        backgroundColor: "rgba(107,152,207,0.2)",
        borderColor: "rgba(107,152,207,1)",
        pointBackgroundColor: "rgba(107,152,207,1)",
        pointStrokeColor: "#fff",
        label: "Gamma",
        data: [1,1,1,1,1,1,1]
      }
    ]
  };
  latestGyroLabel = startingGyroData.labels[6];
  gyroChart = new Chart(ctx2, {
    type: 'line',
    data: startingGyroData,
    options: {
      animationSteps: 15
    }
  });
}