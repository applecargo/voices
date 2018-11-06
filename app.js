// this is a server for 'VOICES'
//  --> exhibition @ loop (by) wonjung-ee @ 2018. 11.

//  --> there's 1 mobmuplat(udp:54321) app., 'the singer'.
//  --> there's 1 node app. receiver(udp:54321 --> tcp:xxxx) for puredata
//  --> this puredata will have a esp8266 controller dedicated. through this, realtime msg. will be broadcasted.
//  --> many WMN (Wifi Mesh Network) devices will respond to this.

//  mobmuplat(udp)
//    --> node app. (udp --> tcp server:socket.io) @ amazon
//    --> node app. (tcp client:socket.io-client) --> udp) @ local
//    --> puredata  (udp)


//// NOTE: this node will take udp messages from mobmuplat and then throw all to connected nodes (tcp websocket)


//// socket.io server (TCP)
var http = require('http');
var express = require('express');
var app = express();
var httpServer = http.createServer(app);
httpServer.listen(7070);

//http socket.io server @ port 7070 (same port as WWW service)
var io = require('socket.io')(httpServer, {
  'pingInterval': 1000,
  'pingTimeout': 3000
});

//socket.io events
io.on('connection', function(socket) {
  //entry log.
  console.log('someone connected.');

  //on 'disconnect'
  socket.on('disconnect', function() {
    console.log('someone disconnected.');
  });
});

//// osc.js configuration (UDP)
var osc = require("osc");

// --> for mobmuplat
//       tx: not used
//       rx: 54321

var udp_mob = new osc.UDPPort({
  localAddress: '0.0.0.0',
  //NOTE: '127.0.0.1' doesn't work!! for comm. between different machines
  // localPort: 54321, //(default)
  localPort: 12345, //(custom)
  metadata: true
});

//osc.js - start service
udp_mob.open();
udp_mob.on("ready", function() {
  console.log(
    "[udp] ready (udp_mob) : \n" +
      "\tlistening on --> " + udp_mob.options.localAddress + ":" + udp_mob.options.localPort + "\n"
  );

  //message handler
  udp_mob.on("message", function (oscmsg, timetag, info) {
    console.log("[udp] got osc message:", oscmsg);

    //EX)
    // //method [1] : just relay as a whole
    // io.emit('osc-msg', oscmsg); //broadcast

    //EX)
    // //method [2] : each fields
    // io.emit('osc-address', oscmsg.address); //broadcast
    // io.emit('osc-type', oscmsg.type); //broadcast
    // io.emit('osc-args', oscmsg.args); //broadcast
    // io.emit('osc-value0', oscmsg.args[0].value); //broadcast

    //just grab i need.. note!
    io.emit('note', oscmsg.address); //broadcast
  });

});
