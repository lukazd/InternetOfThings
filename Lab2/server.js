// Initialize Firebase
var firebase = require("firebase");

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

updateLightRef.on("value", function(snapshot) {
    var updateLight = snapshot.val();
    if (updateLight === true) {
        readLightData();
    }
});

function readLightData() {
    var lightR = 0;
    var lightG = 0;
    var lightB = 0
    var lightColumn = 0;
    var lightRow = 0;

    ref.once("value", function(snapshot) {
        console.log(snapshot.val());
    });
}

/*return firebase.database().ref().once('value').then(function(snapshot) {
  var username = snapshot.val().username;
  var 
});*/
