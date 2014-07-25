/**
 * Copyright (c) 2014 Monitis
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Monitis CJSC
 * @license http://www.opensource.org/licenses/mit-license.html MIT License
 */
var fs = require('fs');
var path = require('path');

/**
 * Cleans URL path to pure directoriy (very similar to the Unix dirname command)
 * @param url
 *            {String} the original url to be cleaning
 * @returns {String} clean path
 */
function cleanURL(url) {
    return(url.replace(/\?.*$/, "")
           .replace(/\/[^\/]*\.[^\/]*$/, "")
           .replace(/\/$/, "") + "/");
}
exports.cleanURL = cleanURL;

/**
 * Returns the user home directory
 */
function home_dir(){
	return JSON.parse(JSON.stringify(process.env)).HOME;
}
exports.home_dir = home_dir;

/**
 * Returns parent dirname if parameter represents a path to file.
 * Otherwise returns the same path.
 */
function dirname(value){
	if (typeof(value) == 'string'){//parameter is string
		if (value.charAt(value.length - 1) != '/') {//path to file
			return value.replace(path.basename(value),'');
		}
		return value;
	}
	return;
}
exports.dirname = dirname;


/**
 * returns file or folder info
 * 
 * @param file_name
 *            {STRING} a name of file or folder
 * @param parameter
 *            {STRING} optional parameter (mode, size, blksize, [a|m|c]time, etc.)
 */
function file_info(file_name, parameter){
	var json = JSON.stringify(fs.statSync(file_name));
	if (parameter === undefined) {
		return json;
	} else {
		return JSON.parse(json)[parameter];
	}
}
exports.file_info = file_info;

/**
 * returns the temporary directory path in the user HOME 
 */
function temp_dir(){
	var tmp_dir = path.join(JSON.parse(JSON.stringify(process.env)).HOME, "tmp");
	if (!fs.existsSync(tmp_dir)) {
		console.log("Creating directory: "+tmp_dir);
		fs.mkdirSync(tmp_dir, 16877);
	}
	return tmp_dir;
}
exports.temp_dir = temp_dir;

//removes file from temporary folder
exports.temp_remove = function(file_name){
	try {
		fs.unlinkSync(path.join(temp_dir(),file_name));
	} catch(e){/*nothing to do*/}
};

//write stored result (temporary action - for debug only)
exports.temp_write = function(file_name, data, type, append){
	var file_path = path.join(temp_dir(),file_name);
	file_write(file_path, data, type, append);
};

//write file asynchronously
function file_write(file_path, data, type, append){
	if (type != undefined && type == 'binary') {
		try {
			fs.unlinkSync(file_path);
		} catch(e){/*nothing to do*/}
		var file1 = fs.createWriteStream(file_path, {'flags': 'a'});
		if (file1){
			file1.write(data);
			file1.end();
		}
	} else {
		fs.open(file_path, (append != undefined?"a+":"w+"), function(err, fd){
			if(err){
				console.error("Couldn't open "+file_path+" ("+err+")");
			} else {
				fs.write(fd, data, 0, 0, 0, function(err, written){
					if (err){
						console.error("Couldn't write to "+file_path+" ("+err+")");
					}
				});
				fs.close(fd);
			}
		});
	}
}
exports.file_write = file_write;

/**
 * Searching of specified file/dir beginning from 'start_dir' up to 'end_dir'. 
 * 
 * At the end of search the full path will returned on success.
 * The default path (def-file_path) can be specified. it will return on search failed.
 */
function search_file(file_path, def_file_path){
	var end_dir = '/';			//root folder as the end dir of searching
	var start_dir = __dirname;	//current folder as the start dir of searching
	var isDir = false
	if (file_path.charAt(file_path.length -1)=='/'){
		isDir = true
	}
	var file = undefined;
	var _file;
	var cur_path = start_dir; // current folder
	while (cur_path != end_dir) {
		_file = path.normalize(path.resolve(cur_path, '..', file_path));
		if (fs.existsSync(_file) && fs.statSync(_file).isDirectory() == isDir) {
			file = _file;
//			console.log("FOUND: "+file);
			break;
		} else {
//			console.log("NOT found "+_file);
			cur_path = path.join(cur_path, '..');
		}
	}
	return file || def_file_path;
}
exports.search_file = search_file;

/**
 * Converts buffer to hex string (lowercase)
 * 
 * @param buffer [BUFFER] Buffer that contain binary data 
 * @return [STRING] lower case hex string 
 */
function hexl(buffer) {
    var str = "";
    for (var i=0; i!=buffer.length; ++i) {
      str += pad(buffer[i], 2);
    }
    return str;
}
exports.hexl = hexl;

/**
 * Converts buffer to hex string (upercase)
 * 
 * @param buffer [BUFFER] Buffer that contain binary data 
 * @return [STRING] upper case hex string 
 */
exports.hexu = function (buffer) {
    return hexl(buffer).toUpperCase();
  };

//---Internally used functions-----
 function pad(b, len) {
    var s = b.toString(16);
    
    while (s.length < len) {
      s = "0" + s;
    }
    return s;
  }
  
 function rpad(s, len) {
    while(s.length < len) {
      s += " ";
    }
    return s;
  }
//-----------------------------------

/**
 * Convert string to hex string
 */
exports.stringtoHex = function (str){
    var r="";
    var e=str.length;
    var c=0;
    var h;
    while(c<e){
        h=str.charCodeAt(c++).toString(16);
        while(h.length<3) h="0"+h;
        r+=h;
    }
    return r;
};

/**
 * Convert string to hex string
 */
exports.stringtoHex2 = function (str) {
	console.log("String to convert = "+str);
    var hex = "";
    for(var i=0;i<str.length;i++) {
    	console.log(i+"-symbol = "+(str.charCodeAt(i)-48));
        hex += ""+(str.charCodeAt(i)-48).toString(16);
        console.log("converting after "+i+" itteration = "+hex);
    }
    return hex;
};

/**
 * Convert string to byte array
 * 
 * @param str [STRING] string to be converted
 * @param bytesPerSymbol [NUMBER] ???
 * @return [ARRAY] converted string
 */
exports.str2bytes = function (str, bytesPerSymbol){
	var arr=[];
		
	for (var i=0;i<str.length;i++){			
			var chCode = str.charCodeAt(i);			
			var temp=chCode;
	
		for(var j=0; j<bytesPerSymbol;j++){			
				var oneByte = Math.floor(temp/Math.pow(255,bytesPerSymbol-j-1));
				arr.push(oneByte);
				temp = temp-oneByte*Math.pow(255,bytesPerSymbol-j-1);			
		} 
	}
	return arr;
};

/**
 * Convert byte array to string
 * 
 * @param arr [ARRAY] byte array to be converted
 * @param bytesPerSymbol [NUMBER] ???
 * @return [STRING] the string representing byte array 
 */
exports.bytes2str = function (arr, bytesPerSymbol){
	var str="";
	
	for (var i=0; i<arr.length; i+=bytesPerSymbol){
		var chCode=0;
		for (var j=0;j<bytesPerSymbol;j++){	
			chCode+=arr.slice(i,i+bytesPerSymbol)[j]*Math.pow(255,bytesPerSymbol-j-1);
		
		}
		str+=String.fromCharCode(chCode);
	}
	return str;
};

/* Hexadecimal conversion methods.
 * Copyright (c) 2006 by Ali Farhadi.
 * released under the terms of the Gnu Public License.
 *
 * Encodes data to Hex(base16) format
 * 
 * @see http://farhadi.ir/
 */
exports.hexEncode = function (data){
	var b16_digits = '0123456789ABCDEF';
	var b16_map = new Array();
	for (var i=0; i<256; i++) {
		b16_map[i] = b16_digits.charAt(i >> 4) + b16_digits.charAt(i & 15);
	}
	
	var result = new Array();
	for (var i=0; i<data.length; i++) {
		result[i] = b16_map[data.charCodeAt(i)];
	}
	
	return result.join('');
};

/**
 * Decodes Hex(base16) formated data
 */
exports.hexDecode = function (data){
	var b16_digits = '0123456789ABCDEF';
	var b16_map = new Array();
	for (var i=0; i<256; i++) {
		b16_map[b16_digits.charAt(i >> 4) + b16_digits.charAt(i & 15)] = String.fromCharCode(i);
	}
	if (!data.match(/^[a-f0-9]*$/i)) return null;// return false if input data is not a valid Hex string
	
	if (data.length % 2) data = '0'+data;
		
	var result = new Array();
	var j=0;
	for (var i=0; i<data.length; i+=2) {
		result[j++] = b16_map[data.substr(i,2)];
	}

	return result.join('');
}

//======================================
/*
 * Converts object properties into array with some calculations defined in the option 
 * 
 * Optional option defines the action for fulfilling specified action on existing property value 
 * by using another (or given value)and put result into property (new one or replace existing one)  
 *  
 * {'property':<new property name>, 'action':{'add'|'subtract'|'divide'|'multiply'}
 * 	'param1':<existing dividend property name>, 
 * 	'param2':<value of action or existing property name>
 * 	}
     */
 function obj2array(obj, option) {
	var arr = [];
	var tmp;
	for ( var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			if (option && Array.isArray(option) && option.length > 0){
				for (var i = 0; i < option.length; i++) {
					opt = option[i];
						if (opt['param1'] && obj[prop][opt['param1']] && opt['param2']) {
							if (typeof opt['param2'] == "number") {
								switch (opt['action']){
									case 'add':
										tmp = (obj[prop][opt['param1']] + opt['param2']).toFixed(3);
										break;
									case 'subtract':
										tmp = (obj[prop][opt['param1']] - opt['param2']).toFixed(3);
										break;																				
									case 'divide':
										tmp = (obj[prop][opt['param1']] / opt['param2']).toFixed(3);
										break;										
									case 'multiply':
										tmp = (obj[prop][opt['param1']] * opt['param2']).toFixed(3);
										break;																				
								}
							} else if (obj[prop][opt['param2']]) {
								switch (opt['action']){
									case 'add':
										tmp = (obj[prop][opt['param1']] + obj[prop][opt['param2']]).toFixed(3);
										break;
									case 'subtract':
										tmp = (obj[prop][opt['param1']] - obj[prop][opt['param2']]).toFixed(3);
										break;																				
									case 'divide':
										tmp = (obj[prop][opt['param1']] / obj[prop][opt['param2']]).toFixed(3);
										break;										
									case 'multiply':
										tmp = (obj[prop][opt['param1']] * obj[prop][opt['param2']]).toFixed(3);
										break;																				
								}
							}
						}
						if (opt['property'])//put into existing property
							obj[prop][opt['property']] = tmp;
				}
			}
			arr.push(obj[prop]);
		}
	}
	return arr;
}
exports.obj2array = obj2array;

 /**
  * Sorting array with objects items byProperty(String <property of object for sorting> [, descending]) 
  * the default sorting style is ascending. e.g. <array>.sort(byProperty("topSpeed"));
  */
 var byProperty = function(prop, descending) {
 	return function(a, b) {
 		var ret = 0;
 		if (!a[prop]) {
 			console.log("a[prop] = " + a[prop]);
 		} else if (typeof a[prop] == "number") {
 			ret = (a[prop] - b[prop]);
 		} else {
 			ret = ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0));
 		}
 		if (descending) {
 			ret = -ret;
 		}
 		return ret;
 	};
 };


/*
 * Converts object into properties array and sort it
 * 
 * where optional option defines the additional actions
 * 
 * { 'byprop':<name of property for sorting by> [, 'descending': {true|false} ] [, 'top': <top_number>][, 'format': <precision number>]
 *   [,'array_option':<array actions> ] }
 *   
 * it returns array without sorting if sorting options isn't defined.
 */   
function sortObject(obj, option) {
	arr = obj2array(obj, option['array_option']);
    if (option['byprop']){
        arr.sort(byProperty(option['byprop'], option['descending']));
    }
    if (option['top'] && option['top'] < arr.length){
    	arr.splice(option['top'],(arr.length - option['top']));
    }
    if (option['format'] && typeof(option['format']) == 'number') {
    	var n = option['format'];
    	arr.forEach(function(v) {
    		if (typeof(v) == 'object'){
    			for(var prop in v){
    				if (typeof(v[prop]) == 'number' && (parseInt(v[prop]) != v[prop])){
    					v[prop] = v[prop].toFixed(n);
    				}
    			}
    		}
    	});
    }
    return arr; // returns array
}    
exports.sortObject = sortObject;
    
/**
 * Direct replacement for Java String.hashCode() method 
 * implemented in Javascript.
 */
hashCode = function(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (var i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
exports.hashCode = hashCode;

//======================================
/**
 * Return the type of o as a string
 * -If o is null, return "null", if o is NaN, return "nan".
 * -If typeof returns a value other than "object" return that value.
 *  (Note that some implementations identify regexps as functions.)
 * -If the class of o is anything other than "Object", return that.
 * -If o has a constructor and that constructor has a name, return it.
 * -Otherwise, just return "Object".
 */
exports.var_type = function (o) {
	var t, c, n; // type, class, name
	// Special case for the null value:
	if (o === null) return "null";
	// Another special case: NaN is the only value not equal to itself:
	if (o !== o) return "nan";
	// Use typeof for any value other than "object".
	// This identifies any primitive value and also functions.
	if ((t = typeof o) !== "object") return t;
	// Return the class of the object unless it is "Object".
	// This will identify most native objects.
	c = Object.prototype.toString.call(o).slice(8,-1);
	if (c !== "Object") return c;
	// Return the object's constructor name, if it has one
	if (o.constructor && typeof o.constructor === "function" &&
	(n = o.constructor.getName())) return n;

	// We can't determine a more specific type, so return "Object"
	return "Object";
};

/**
 * Return the name of a function (may be "") or null for nonfunctions
 */ 
Function.prototype.getName = function() {
	if ("name" in this) return this.name;
	return this.name = this.toString().match(/function\s*([^(]*)\(/)[1];
};
	

/**
sprintf() for JavaScript 0.7-beta1
http://www.diveintojavascript.com/projects/javascript-sprintf

sprintf() for JavaScript is a complete open source JavaScript sprintf implementation.

It's prototype is simple:

string sprintf(string format , [mixed arg1 [, mixed arg2 [ ,...]]]);
The placeholders in the format string are marked by "%" and are followed by one or more of these elements, in this order:

An optional "+" sign that forces to preceed the result with a plus or minus sign on numeric values. 
By default, only the "-" sign is used on negative numbers.

An optional padding specifier that says what character to use for padding (if specified). 
Possible values are 0 or any other character precedeed by a '. The default is to pad with spaces.

An optional "-" sign, that causes sprintf to left-align the result of this placeholder. 
The default is to right-align the result.

An optional number, that says how many characters the result should have. 
If the value to be returned is shorter than this number, the result will be padded.

An optional precision modifier, consisting of a "." (dot) followed by a number, 
that says how many digits should be displayed for floating point numbers. 
When used on a string, it causes the result to be truncated.

A type specifier that can be any of:
% - print a literal "%" character
b - print an integer as a binary number
c - print an integer as the character with that ASCII value
d - print an integer as a signed decimal number
e - print a float as scientific notation
u - print an integer as an unsigned decimal number
f - print a float as is
o - print an integer as an octal number
s - print a string as is
x - print an integer as a hexadecimal number (lower-case)
X - print an integer as a hexadecimal number (upper-case)
**/
var sprintf = (function() {
	function get_type(variable) {
		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
	}
	function str_repeat(input, multiplier) {
		for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
		return output.join('');
	}

	var str_format = function() {
		if (!str_format.cache.hasOwnProperty(arguments[0])) {
			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
		}
		return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
	};

	str_format.format = function(parse_tree, argv) {
		var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
		for (i = 0; i < tree_length; i++) {
			node_type = get_type(parse_tree[i]);
			if (node_type === 'string') {
				output.push(parse_tree[i]);
			}
			else if (node_type === 'array') {
				match = parse_tree[i]; // convenience purposes only
				if (match[2]) { // keyword argument
					arg = argv[cursor];
					for (k = 0; k < match[2].length; k++) {
						if (!arg.hasOwnProperty(match[2][k])) {
							throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
						}
						arg = arg[match[2][k]];
					}
				}
				else if (match[1]) { // positional argument (explicit)
					arg = argv[match[1]];
				}
				else { // positional argument (implicit)
					arg = argv[cursor++];
				}

				if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
					throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
				}
				switch (match[8]) {
					case 'b': arg = arg.toString(2); break;
					case 'c': arg = String.fromCharCode(arg); break;
					case 'd': arg = parseInt(arg, 10); break;
					case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
					case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
					case 'o': arg = arg.toString(8); break;
					case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
					case 'u': arg = Math.abs(arg); break;
					case 'x': arg = arg.toString(16); break;
					case 'X': arg = arg.toString(16).toUpperCase(); break;
				}
				arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
				pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
				pad_length = match[6] - String(arg).length;
				pad = match[6] ? str_repeat(pad_character, pad_length) : '';
				output.push(match[5] ? arg + pad : pad + arg);
			}
		}
		return output.join('');
	};

	str_format.cache = {};

	str_format.parse = function(fmt) {
		var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
		while (_fmt) {
			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
				parse_tree.push(match[0]);
			}
			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
				parse_tree.push('%');
			}
			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
				if (match[2]) {
					arg_names |= 1;
					var field_list = [], replacement_field = match[2], field_match = [];
					if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
						field_list.push(field_match[1]);
						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
							if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else {
								throw('[sprintf] huh?');
							}
						}
					}
					else {
						throw('[sprintf] huh?');
					}
					match[2] = field_list;
				}
				else {
					arg_names |= 2;
				}
				if (arg_names === 3) {
					throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
				}
				parse_tree.push(match);
			}
			else {
				throw('[sprintf] huh?');
			}
			_fmt = _fmt.substring(match[0].length);
		}
		return parse_tree;
	};

	return str_format;
})();

/**
 * vsprintf() is the same as sprintf() except that it accepts an array of arguments, rather than a variable number of arguments:
 *
 *    vsprintf('The first 4 letters of the english alphabet are: %s, %s, %s and %s', ['a', 'b', 'c', 'd']);
 */
var vsprintf = function(fmt, argv) {
	argv.unshift(fmt);
	return sprintf.apply(null, argv);
};
exports.sprintf = sprintf;
exports.vsprintf = vsprintf;

/**
 * Format a timestamp into the form 'x-hh:mm:ss'
 * 
 * @param timestamp
 *            the timestamp in sec
 * @returns formatted string
 */
function formatTimestamp(timestamp){
	var time = timestamp;
	var sec = Math.floor(time%60);
	var min = Math.floor((time/60)%60);
	var hr = Math.floor((time/3600)%24);
	var da = Math.floor(time/86400);
	var str = sprintf("%02d.%'02d.%'02d", hr, min, sec);
	if (da > 0){
		str = da + "-" + str; 
	}
	return str;
}
exports.formatTimestamp = formatTimestamp;

/**
 * Clones any Object (even non-object)
 * 
 * @param obj
 *            the source object
 * @returns
 */
function clone(obj){
    if(obj == null || typeof(obj) != 'object')
        return obj;    
//	var temp = JSON.parse(JSON.stringify(obj));
    var temp = new obj.constructor(); 
    for(var key in obj)
        temp[key] = clone(obj[key]);    
    return temp;
}
exports.clone = clone;

