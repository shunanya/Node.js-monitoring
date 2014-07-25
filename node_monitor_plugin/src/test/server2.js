/**
 * Testing with Express framework
 */
var express = require('express')
   ,monitor = require('node-monitor');

var app = express();
var req_count = 0;
var t = new Date().getTime();
var load_dur = 1000;
var msg = "hello, i know nodejitsu.";

app.get('/', function(req, res) {
    res.send('Hello Express!!');
});
app.post("/fcgi-bin/agentgateway", function(req, res, next) {

	res.set({
		'Content-Type' : 'text/plain',
		'Mon-SessionID' : '1a8c7e19502002b037b948714357dd3f1309960401',
		'content-length': msg.length,
		'connection': 'close'});
	res.send(200, msg);
	
	 var te = new Date().getTime();
	 if ((te-t) >= load_dur) {
		 console.warn("\n******* average load is "+req_count/(te - t)+" req/s\n");
		 t = te;
		 req_count = 0;
	 }
	 req_count++;

});

var server = app.listen(8080);

monitor.Monitor(server, {'top':{'view':4,'timelimit':0, 'limit':4}});//add server to monitor

server.on('listening', function() {
    console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});

console.log('Express server started on port %s', 8080);
