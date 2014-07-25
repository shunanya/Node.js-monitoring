(function() {
var path = require('path')
	,fs = require('fs')
	, log4js = require('log4js')
	, utils = require('./utils');

/**
	 * rewrite log4js configuration file by replacing relative paths to absolute
	 * 
	 * @param log_file
	 *            absolute or relative path to the log file
 */
	function correcting(log_file) {
		console.log("Logger: opening log-conf file: " + log_file);
		var log = fs.readFileSync(log_file, 'utf8');
		var d = false;
		var json = JSON.parse(log, function(key, value) {
			if (key == 'filename') {
				var dirname = utils.dirname(value);
				var basename = value.replace(dirname, '');
				var file = utils.search_file(dirname);
				file = path.join(file, basename)
				if (file != value) {
					value = file;
					d = true;
				}
			}
			return value;
		});
		if (d) {
			var logFileCorrect = log_file + ".new";
			console.log("Logger: write corrections to " + logFileCorrect);
			fs.writeFileSync(logFileCorrect, JSON.stringify(json, null, 2));
			return logFileCorrect;
		} else {
			console.log("Logger: Config-file - There is nothing to correct!!!");
		}
		return log_file;
}

//source parameters
var log_conf ='./properties/log4js.json';//relative path to the properties file (JSON)
	var conf_file = utils.search_file(log_conf);
if (conf_file){
		log4js.configure(correcting(conf_file), {});

}

var Logger = function(logger_name){
	var log = log4js.getLogger(logger_name);
		log.info(">>>>>>>>> Logger for '" + log.category + "' initialized with success. Log Level: " + log.level + " <<<<<<<<<");
	return log;
}

exports.Logger = Logger;

//levels = {
//    ALL: new Level(Number.MIN_VALUE, "ALL", "grey"),
//    TRACE: new Level(5000, "TRACE", "blue"),
//    DEBUG: new Level(10000, "DEBUG", "cyan"),
//    INFO: new Level(20000, "INFO", "green"),
//    WARN: new Level(30000, "WARN", "yellow"),
//    ERROR: new Level(40000, "ERROR", "red"),
//    FATAL: new Level(50000, "FATAL", "magenta"),
//    OFF: new Level(Number.MAX_VALUE, "OFF", "grey")  
//}
})()
