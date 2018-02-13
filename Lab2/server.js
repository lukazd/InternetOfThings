// Initialize Firebase
var firebase = require("firebase");

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

setupDatabase();

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
        Light_Row: lightRow
    });

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
        Humidity: 21,
        Temperature: 29
    });
}

function updateDisplay() {
    // TODO: add display update funcitonality
}
