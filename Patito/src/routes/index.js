//just const about the router
const express = require('express');
const router = express.Router();



//firebase configuration
const admin = require('firebase-admin');
const serviceAccount = require("../../sharedocumentsapp-firebase-adminsdk-zus5z-50c8d77664.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sharedocumentsapp-default-rtdb.firebaseio.com/'
});
const db = admin.database();


//configuration and reading for the serial port
const SerialPort = require('serialport').SerialPort;
const {DelimiterParser} = require('@serialport/parser-delimiter');
const puerto = new SerialPort({path: 'COM8', baudRate: 9600});
const parser = puerto.pipe(new DelimiterParser({delimiter: '\n'}));

parser.on('open', function () {
  console.log('lectura inicializada');
});

var dataString = "";

parser.on('data', function (data) {
  var enc = new TextDecoder();
  var arr = new Uint8Array(data);
  dataString = enc.decode(data)
  console.log(dataString);
});

parser.on('error', function (err) {
  console.log(err);
});



//main routes for the app
router.get('/', (req, res) => {
  dataString = "";
  res.render('index');
});


//rest api querys
router.get('/documents', (req, res) => {

  db.ref('Uploads').once('value', (snapshot) => {
    let arry = [];
    
    snapshot.forEach(function (childSnapshot){

      //const ctag = (childSnapshot.val().name).slice(0, dataString.length-1).toString();
      const ctag = (childSnapshot.val().name).toString();

      if(ctag.includes(dataString.trim())){

        arry.push(childSnapshot.val());

      }

    });

    res.json(arry);

  });

});


router.get('/update', (req, res) => {

  db.ref('Status').once('value', (snapshot) => {

    let usrData;

    snapshot.forEach(function (childSnapshot) {

      if(dataString!=''){
        if(dataString.trim().includes(childSnapshot.key)){
          if(childSnapshot.val().status){
            usrData = childSnapshot.val();
          }
        }
      }

    });

    res.json(usrData);

  });

});



module.exports = router;