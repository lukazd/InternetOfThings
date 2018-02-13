// Initialize Firebase
var config = {
apiKey: "AIzaSyCmygaoS_IaPm2FIhCmgZwhAsLSKENjTy0",
        authDomain: "sensor-lights.firebaseapp.com",
        databaseURL: "https://sensor-lights.firebaseio.com",
        projectId: "sensor-lights",
        storageBucket: "sensor-lights.appspot.com",
        messagingSenderId: "955884633808"
};
firebase.initializeApp(config);

var firebase = require(“firebase”);
var database = firebase.database();

var ref = database.ref().child("Update_Light")

ref.on("child_added", function(snapshot, prevChildKey) {
        var newPost = snapshot.val();
        console.log("Author: " + newPost.author);
        console.log("Title: " + newPost.title);
        console.log("Previous Post ID: " + prevChildKey);
        });
