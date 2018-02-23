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
setUpDatabase();

console.time("async");
setInterval(getIMUdata, 60000);

sense.clear();

updateLightRef.on("value", function(snapshot) {
    var updateLight = snapshot.val();
    if (updateLight === true) {
        readLightData();
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
        Update_Light: false
    });
}

function getIMUdata() {
    var data = IMU.getValueSync();
    var str2 = "";

    if (data.temperature && data.humidity) {
        temperature = data.temperature.toFixed(4);
        humidity = data.humidity.toFixed(4);
        str2 = util.format('Temperature: %s deg Celsius \nHumidity: %s \%', temperature, humidity);
        console.log(str2);
        writeSensorData();
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

function writeSensorData() {
    ref.update({
        Humidity: parseFloat(humidity),
        Temperature: parseFloat(temperature)
    });
    console.log("Wrote sensor data to database")
}

function updateDisplay() {
    sense.clear();
    sense.setPixel(lightRow, lightColumn, lightR, lightG, lightB);
    console.log("Changed light")
    console.log("Row = " + lightRow + " Column = " +  lightColumn)
    console.log("R = " + lightR + " G = " +  lightG + " B = " + lightB)
}
