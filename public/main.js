// SocketIO
var socket = io();
var connected = false;

// Graph Variables
var ctx1, startingAccData, accChart, latestAccLabel;
var ctx2, startingGyroData, gyroChart, latestGyroLabel;
initAccChart();
initGyroChart();

// Map Variables
var deviceMap, position, deviceWatcher, devicePin;
if ('geolocation' in navigator) {
  // Get first position
  navigator.geolocation.getCurrentPosition(function(pos) {
    position = [ pos.coords.latitude, pos.coords.longitude ];
  });
  
  deviceWatcher = navigator.geolocation.watchPosition(function(pos) {
    // Update position
    position = [ pos.coords.latitude, pos.coords.longitude ];
    
    // Update clients and server
    socket.emit('location', position);
    
    // Init map
    if (!deviceMap) initMap(position);
  }, function(error) {
    if (error) $('#error').text('There seems to be an issue with loading the maps and identifying the location of the device. This is caused by the map provider and is unrelated to Clayster. Please check in again later or use a different browser.');
  }, { enableHighAccuracy: true });
} else {
  // Geolocation unsupported
  $('#map').innerHTML = "Geolocation not supported on connected phone (device).";
}

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
  if (!devicePin) {
    // Add devicePin to Map
    var icon = L.icon({
      iconUrl: './smartphone.png',
      iconSize: [15.96, 30]
    });
    
    devicePin = L.marker(position, {
      icon: icon,
      title: 'Connected Sensors',
      riseOnHover: true
    });
    if (deviceMap) devicePin.addTo(deviceMap);
  }
});

// On location update
socket.on('location', function(data) {
  // Update device pin on map
  if (position && devicePin) {
    devicePin.bindPopup('<b>Smartphone Location</b><br>Lat : '+data.position[0].toFixed(2)+'<br>Lng: '+data.position[1].toFixed(2));
    position = [data.position[0], data.position[1]];
    devicePin.setLatLng(position);
    devicePin.update();
  }
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
  // Remove old data and add new data to accelerometer
  accChart.data.datasets[0].data.shift();
  accChart.data.datasets[1].data.shift();
  accChart.data.datasets[2].data.shift();
  accChart.data.datasets[0].data.push(data.accelerometer.x);
  accChart.data.datasets[1].data.push(data.accelerometer.y);
  accChart.data.datasets[2].data.push(data.accelerometer.z);
  accChart.data.labels.push(++latestAccLabel);
  accChart.data.labels.shift();
  accChart.update();
  
  // Remove old data and add new data to gyro
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
  // Remove pin from map
  if(deviceMap && devicePin) deviceMap.removeLayer(devicePin);
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

// Setup map
function initMap(position) {
  var initZoom = 13;
    
  // Init map
  deviceMap = L.map('map').setView(position, initZoom);
  
  // Add tiles
  // create the tile layer with correct attribution
  L.tileLayer('https://api.mapbox.com/styles/v1/hug-0/ciopx04ul000yolkngrt99n9b/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 20,
      accessToken: 'pk.eyJ1IjoiaHVnLTAiLCJhIjoiY2lvcHd0dzN3MDBjZnVwa3E0MGk1dnVwMiJ9.bsu99nJKHMSnK5j17qFASA'
  }).addTo(deviceMap);
  
  // // Add devicePin to Map
  // var icon = L.icon({
  //   iconUrl: './smartphone.png',
  //   iconSize: [15.96, 30]
  // });
  // 
  // devicePin = L.marker(position, {
  //   icon: icon,
  //   title: 'Connected Sensors',
  //   riseOnHover: true
  // });
  
  devicePin.bindPopup('<b>Smartphone Location</b><br>');
  
  devicePin.addTo(deviceMap);
}