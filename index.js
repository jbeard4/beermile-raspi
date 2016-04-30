var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var fs = require('fs');

var LOG_FILE = 'log.dat';
var DEBOUNCE_TIMEOUT = 1000;    //ms



fs.open(LOG_FILE, 'a', function(err, fd){
  if(err) throw err;

  var port = new SerialPort('/dev/ttyACM0', {
    parser: serialport.parsers.readline('\n'),
    baudrate: 115200
  });

  var debounceFlags = {};

  port.on('data', function (data) {
    //console.log('Data: ' + data);
    var m = data.match(re);
    if(m){
      var hexStr = m[1];
      var timestamp = new Date();

      if(debounceFlags[hexStr]) return;

      console.log('Found a card', hexStr);

      debounceFlags[hexStr] = timestamp; 
      setTimeout(function(){
        debounceFlags[hexStr] = null;
      },DEBOUNCE_TIMEOUT); 

      //persist rfid, timestamp
      //TODO: maybe debounce? 
      var s = hexStr + ',' + timestamp.toISOString() + '\n';
      fs.write(fd, s, function(err){
        if(err){
          console.log('Error writing file!', s);
          return;
        }
      }) 
    }
  });


})

var re = /^UID Value:  (0x[0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F])/;
var s = 'UID Value:  0xE6C2F1C5';

