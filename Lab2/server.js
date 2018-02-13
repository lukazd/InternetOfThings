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

var updateLightRef = database.ref().child("Update_Light")

updateLightRef.on("value", function(snapshot) {
    var updateLight = snapshot.val();
    if (updateLight === true) {
        readLightData();
    }
});

function readLightData() {
    process.stdout.write("Update light works");
}

/*return firebase.database().ref().once('value').then(function(snapshot) {
  var username = snapshot.val().username;
  var 
});*/
