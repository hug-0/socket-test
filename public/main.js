// SocketIO
var socket = io();
var connected = false;

// Graph Variables
var ctx1, startingAccData, accChart, latestAccLabel;
var ctx2, startingGyroData, gyroChart, latestGyroLabel;
initAccChart();
initGyroChart();

// Check viewport & basic device type to hide/show controller text
if (/Mobi/i.test(navigator.userAgent) || /Tablet/i.test(navigator.userAgent)) {
  $('.if-phone').css('display', 'block');
  $('.if-phone').css('visibility', 'visible');
}

// Render any messages from conversation stored on server upon connection
socket.on('connection', function(data) {
  connected = true;
  socket.emit('joined');
});

// Tell clients when someone connects
socket.on('joined', function(data) {
  
});

// Phone data listener
if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', function(data) {
    if ((typeof data !== 'undefined') || (typeof data.accelerationIncludingGravity.x !== 'undefined')) {
      var acceleration = data.accelerationIncludingGravity;
      var gyro = data.rotationRate;
      var d = {
        accelerometer: acceleration,
        gyro: gyro,
        interval: data.interval
      };
      socket.emit('phone', d);
    } else {
      $('#phone-text').text('Your phone does not seem to send any actual sensor data. If you have an Android that might be the issue. Please try again with an iPhone.');
      $('#phone-text-h2').text('Device not supported');
    }
  }, false);
}

socket.on('phone', function(data) {  
  // Remove old data and add new data
  accChart.data.datasets[0].data.shift();
  accChart.data.datasets[1].data.shift();
  accChart.data.datasets[2].data.shift();
  accChart.data.datasets[0].data.push(data.accelerometer.x);
  accChart.data.datasets[1].data.push(data.accelerometer.y);
  accChart.data.datasets[2].data.push(data.accelerometer.z);
  accChart.data.labels.push(++latestAccLabel);
  accChart.data.labels.shift();
  accChart.update();
  
  gyroChart.data.datasets[0].data.shift();
  gyroChart.data.datasets[1].data.shift();
  gyroChart.data.datasets[2].data.shift();
  gyroChart.data.datasets[0].data.push(data.gyro.alpha);
  gyroChart.data.datasets[1].data.push(data.gyro.beta);
  gyroChart.data.datasets[2].data.push(data.gyro.gamma);
  gyroChart.data.labels.push(++latestGyroLabel);
  gyroChart.data.labels.shift();
  gyroChart.update();
});

// Tell clients when someone disconnects
socket.on('left', function(data) {
  
});

// Graph stuff
function initAccChart() {
  ctx1 = document.getElementById("acc-chart").getContext("2d");
  startingAccData = {
    labels: [1,2,3,4,5,6,7],
    datasets: [
      {
        fill: false,
        backgroundColor: "rgba(234,108,108,0.2)",
        borderColor: "rgba(234,108,108,1)",
        pointBackgroundColor: "rgba(234,108,108,1)",
        pointStrokeColor: "#fff",
        label: "X-acceleration",
        data: [0,0,0,0,0,0,0]
      },
      {
        fill: false,
        backgroundColor: "rgba(68,183,132,0.2)",
        borderColor: "rgba(68,183,132,1)",
        pointBackgroundColor: "rgba(68,183,132,1)",
        pointStrokeColor: "#fff",
        label: "Y-acceleration",
        data: [0,0,0,0,0,0,0]
      },
      {
        fill: false,
        backgroundColor: "rgba(107,152,207,0.2)",
        borderColor: "rgba(107,152,207,1)",
        pointBackgroundColor: "rgba(107,152,207,1)",
        pointStrokeColor: "#fff",
        label: "Z-acceleration",
        data: [0,0,0,0,0,0,0]
      }
    ]
  };
  latestAccLabel = startingAccData.labels[6];
  accChart = new Chart(ctx1, {
    type: 'line',
    data: startingAccData,
    options: {
      animationSteps: 15,
      scales: {
        yAxes: [
          {
            ticks: {
              min: -15,
              max: 15
            }
          }
        ]
      }
    }
  });
}
function initGyroChart() {
  ctx2 = document.getElementById("gyro-chart").getContext("2d");
  startingGyroData = {
    labels: [1,2,3,4,5,6,7],
    datasets: [
      {
        fill: false,
        backgroundColor: "rgba(234,108,108,0.2)",
        borderColor: "rgba(234,108,108,1)",
        pointBackgroundColor: "rgba(234,108,108,1)",
        pointStrokeColor: "#fff",
        label: "Alpha",
        data: [0,0,0,0,0,0,0]
      },
      {
        fill: false,
        backgroundColor: "rgba(68,183,132,0.2)",
        borderColor: "rgba(68,183,132,1)",
        pointBackgroundColor: "rgba(68,183,132,1)",
        pointStrokeColor: "#fff",
        label: "Beta",
        data: [0,0,0,0,0,0,0]
      },
      {
        fill: false,
        backgroundColor: "rgba(107,152,207,0.2)",
        borderColor: "rgba(107,152,207,1)",
        pointBackgroundColor: "rgba(107,152,207,1)",
        pointStrokeColor: "#fff",
        label: "Gamma",
        data: [0,0,0,0,0,0,0]
      }
    ]
  };
  latestGyroLabel = startingGyroData.labels[6];
  gyroChart = new Chart(ctx2, {
    type: 'line',
    data: startingGyroData,
    options: {
      animationSteps: 15,
      scales: {
        yAxes: [
          {
            ticks: {
              min: -600,
              max: 600
            }
          }
        ]
      }
    }
  });
}