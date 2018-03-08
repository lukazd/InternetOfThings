var firebase = require("firebase");
var util = require('util');
var nodeimu  = require('nodeimu');
var sense = require("sense-hat-led").sync;

var IMU = new nodeimu.IMU();

var humidity = 0;
var temperature = 0;
var lightR = 0;
var lightG = 0;
var lightB = 0
var lightColumn = 0;
var lightRow = 0;
var interval = 1

/*
var noble = require('noble');

uartTx = null;
// Chewck if BLE adapter is powered on
noble.on('stateChange', function(state) {
  if(state === 'poweredOn') {
    console.log('Powered on!');
    noble.startScanning();
  }
});

//Register function to receive newly discovered devices
noble.on('discover', function(device) {
  console.log('Found devices');
  if(device.address === 'c3:4a:cc:3b:48:84') {
    console.log('Found device: ' + device.address);
    //found our device, now connect to it
    //Be sure to turn off scanning before connecting
    noble.stopScanning();
    device.connect(function(error) {
      // Once connected, we need to kick off service discovery
      device.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
        console.log("GOT HERE");
        //Discovery done! Find characteristics we care about
        //var uartTx = null;
        var uartRx = null;
        //look for UART service characteristic
        characteristics.forEach(function(ch, chID) {
          if (ch.uuid === '6e400002b5a3f393e0a9e50e24dcca9e') {
            uartTx = ch;
            console.log("Found UART Tx characteristic");
          }
          if (ch.uuid === '2a6e') {
            uartRx = ch;
            console.log("Found UART Rx characteristic");
          }
        });
        //Check if we found UART Tx characteristic
        if (!uartTx) {
          console.log('Failed to find UART Tx Characteristic! ');
          process.exit();
        }
        //Check if we found UART Rx characteristic
        if (!uartRx) {
          console.log('Failed to find UART Rx Characteristic! ');
          process.exit();
        }
        //set up listener for console input
        //when console input is received, send it to uartTx
        var stdin = process.openStdin();
        stdin.addListener("data", function (d) {
          // d will have a linefeed at the end.  Get rid ofit with trim
          var inStr = d.toString().trim();
          //Can only send 20 bytes in a Bluetooth LE packet
          //so truncate string if it is too long
          if (inStr.length > 20) {
            inStr = inStr.slice(0, 19);
          }
          console.log("Sent: " + inStr);
          uartTx.write(new Buffer(inStr));
        });
        // Now set up listener to receive data from uartRx
        //and display on console
        uartRx.notify(true);
        uartRx.once('read', function(data, isNotification) {
          console.log("Received TEST");
          //temp = data.toString();
          //console.log ("Received: " + temp);
        });
      });  //end of device.discover
    });   //end of device.connect
  }      //end of if (device.address...
});     //end of noble.on   
*/

//"use strict";

var uartTx = null;
var noble = require('noble');
// Chewck if BLE adapter is powered on
noble.on('stateChange', function(state) {
  if(state === 'poweredOn') {
    console.log('Powered on!');
    noble.startScanning();
  }
});

//Register function to receive newly discovered devices
noble.on('discover', function(device) {
  if(device.address === 'c3:4a:cc:3b:48:84') {
    console.log('Found device: ' + device.address);
    //found our device, now connect to it
    //Be sure to turn off scanning before connecting
    noble.stopScanning();
    device.connect(function(error) {
      // Once connected, we need to kick off service discovery
      device.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
        //Discovery done! Find characteristics we care about
        var uartRx = null;
        //look for UART service characteristic
        characteristics.forEach(function(ch, chID) {
          if (ch.uuid === '6e400002b5a3f393e0a9e50e24dcca9e') {
            uartTx = ch;
            console.log("Found UART Tx characteristic");
          }
          if (ch.uuid === '2a6e') {
            uartRx = ch;
            console.log("Found UART Rx characteristic");
          }
        });
        //Check if we found UART Tx characteristic
        if (!uartTx) {
          console.log('Failed to find UART Tx Characteristic! ');
          process.exit();
        }
        //Check if we found UART Rx characteristic
        if (!uartRx) {
          console.log('Failed to find UART Rx Characteristic! ');
          process.exit();
        }
        //set up listener for console input
        //when console input is received, send it to uartTx
        var stdin = process.openStdin();
        stdin.addListener("data", function (d) {
          // d will have a linefeed at the end.  Get rid ofit with trim
          var inStr = d.toString().trim();
          //Can only send 20 bytes in a Bluetooth LE packet
          //so truncate string if it is too long
          if (inStr.length > 20) {
            inStr = inStr.slice(0, 19);
          }
          console.log("Sent: " + inStr);
          uartTx.write(new Buffer(inStr));
        });
        // Now set up listener to receive data from uartRx
        //and display on console
        uartRx.notify(true);
        uartRx.on('read', function(data, isNotification) {
    	temperature = (data[0] + data[1] *256)/100;
        writeTemperatureData()
        console.log("Temp from Arduino: " + temperature);
        });
      });  //end of device.discover
    });   //end of device.connect
  }      //end of if (device.address...
});     //end of noble.on   

var config = {
apiKey: "AIzaSyCmygaoS_IaPm2FIhCmgZwhAsLSKENjTy0",
        authDomain: "sensor-lights.firebaseapp.com",
        databaseURL: "https://sensor-lights.firebaseio.com",
        projectId: "sensor-lights",
        storageBucket: "sensor-lights.appspot.com",
        messagingSenderId: "955884633808"
};
firebase.initializeApp(config);

var database = firebase.database();
var ref = database.ref();
var updateLightRef = database.ref().child("Update_Light");
var updateIntervalRef = database.ref().child("Interval");
setUpDatabase();
sendInterval();

console.time("async");
setTimeout(getIMUdata, 1000*interval);

updateLightRef.on("value", function(snapshot) {
    var updateLight = snapshot.val();
    if (updateLight === true) {
        readLightData();
    }
});

updateIntervalRef.on("value", function(snapshot) {
    var updateInterval = snapshot.val();
    if (Number.isInteger(updateInterval) && updateInterval >= 1 && updateInterval <= 10) {
        interval = updateInterval
        sendInterval();
    }
});

function setUpDatabase() {
    ref.set({
        Humidity: humidity,
        Temperature: temperature,
        Light_R: lightR,
        Light_G: lightG,
        Light_B: lightB,
        Light_Column: lightColumn,
        Light_Row: lightRow,
        Update_Light: false,
        Interval: interval
    });
}

function getIMUdata() {
    setTimeout(getIMUdata, 1000*interval);
    var data = IMU.getValueSync();
    var str2 = "";

    if (data.humidity) {
        humidity = parseFloat(data.humidity.toFixed(4));
        str2 = util.format('Humidity: %s \%', humidity);
        console.log(str2);
        writeHumidityData();
    }
}


function readLightData() {
    ref.once("value", function(snapshot) {
        dbVals = snapshot.val();
        lightR = dbVals["Light_R"];
        lightG = dbVals["Light_G"];
        lightB = dbVals["Light_B"];
        lightColumn = dbVals["Light_Column"];
        lightRow = dbVals["Light_Row"];
        updateDisplay();
        writeSensorData();
    });
}

function writeHumidityData() {
    ref.update({
        Humidity: humidity
    });
    console.log("Wrote humidity data to database")
}

function writeTemperatureData() {
    ref.update({
        Temperature: temperature
    });
    console.log("Wrote temperature data to database")
}

function updateDisplay() {
    sense.clear();
    sense.setPixel(lightRow, lightColumn, lightR, lightG, lightB);
    console.log("Changed light")
    console.log("Row = " + lightRow + " Column = " +  lightColumn)
    console.log("R = " + lightR + " G = " +  lightG + " B = " + lightB)
}

function sendInterval() {
    // Update the arduino 
    if(uartTx != null){
      uartTx.write(new Buffer(String(interval)));
    }
}
