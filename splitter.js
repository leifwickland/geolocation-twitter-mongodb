var http = require('http');
var url = require('url');
var fs = require('fs');

if (process.argv.length < 5) {
  console.log("USAGE: " + process.argv[0] + " " + process.argv[1] + " <serverPort> <URL> <logFile> [postData]");
  process.exit(1);
}

var serverPort = process.argv[2];
var urlToSplit = url.parse(process.argv[3]);
var logPath = process.argv[4]
var postData = (process.argv.length > 5 ? process.argv[5] : "");
console.log("Port: " + serverPort + "   URL: " + urlToSplit.href + "   LogPath: " + logPath + "   PostData: " + postData);

var logStream = fs.createWriteStream(logPath, { flags: 'a+', encoding: null, mode: 0666 });
function base64Encode(input) {
  var buffer = new Buffer(input.length, 'ascii')
  buffer.write(input)
  return buffer.toString('base64')
}

function urlToHttpOptions(url) {
  var options = {
    host: url.hostname,
    port: (url.port || 80),
    path: url.pathname + (url.search || ""),
    method: (postData ? "POST" : "GET"),
    headers: {},
  };
  if (postData) {
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }
  if (url.auth) {
    options.headers["Authorization"] = "Basic " + base64Encode(url.auth); 
  }
  console.log("Options: " + dumpObjectIndented(options));
  return options;
}

function dumpObjectIndented(obj, indent) { var result = ""; if (indent == null) indent = ""; for (var property in obj) { var value = obj[property]; if (typeof value == 'string') { value = "'" + value + "'"; } else if (typeof value == 'object') { if (value instanceof Array) { /* Just let JS convert the Array to a string! */ value = "[ " + value + " ]"; } else { /*  Recursive dump (replace "  " by "\t" or something else if you prefer) */ var od = dumpObjectIndented(value, indent + "  "); /* If you like { on the same line as the key value = "{\n" + od + "\n" + indent + "}"; If you prefer { and } to be aligned */ value = "\n" + indent + "{\n" + od + "\n" + indent + "}"; } } result += indent + "'" + property + "' : " + value + ",\n"; } return result.replace(/,\n$/, ""); }

function urlToHttpRequest(url) {
  var req = http.request(urlToHttpOptions(url), function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (data) {
      console.log("Origin Data: " + data);
      for (i in responseStreams) {
        responseStreams[i].write(data, 'binary');
      }
    });
  });

  req.on('error', function(ex) {
    // This needs to restart the request on failure.
    console.log("Origin error: " + ex.message)
  });
  req.on('end', function() {
    console.log("Origin end");
  });
  if (postData) {
    console.log("Writing POST data: " + postData)
    req.write(postData + "\n\n")
  }
  else {
    console.log("Not writing POST data");
  }
  req.end();
  return req;
}

var responseStreams = [ logStream ];

function serverCallback(request, response) {
  console.log("Got a new listener");
  responseStreams.push(response);
}

console.log("Creating server listening on " + serverPort);
http.createServer(serverCallback).listen(serverPort);

urlToHttpRequest(urlToSplit);
