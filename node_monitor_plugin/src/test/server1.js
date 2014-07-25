/**
 * Testing with Node.js pure server
 */
var http = require('http')
	,monitor = require('node-monitor')
//	,monitor = require('../monitor')
	;

var msg = "hello, i know nodejitsu.";

var server = http.createServer(function(req, res) {
	
	server.emit('agent_request', req);
	
	res.writeHead(200, {
		'Content-Type' : 'text/plain',
		'Mon-SessionID' : '1a8c7e19502002b037b948714357dd3f1309960401',
		'content-length': msg.length,
		'connection': 'close'
	});
	res.write(msg);
	res.end();
}).listen(8080);

monitor.Monitor(server);//add server to monitor

console.log('> Server running on port 8080');
