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

var responseStreams = [ ];
var consecutiveFailedWrites = [];
var failureThreshold = 1000;
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

function recordFailedWrite(index) {
  if ((consecutiveFailedWrites[index] += 1) > failureThreshold) {
    responseStreams[index] = null;
    console.log("Evicted listener " + index + " because it failed " + failureThreshold + " consecutive writes.");
  }
}

function recordSuccessfulWrite(index) {
  consecutiveFailedWrites[index] = 0;
}

var dataCount = 0;
var consecutiveErrorCount = 0;
function urlToHttpRequest(url) {
  var req = http.request(urlToHttpOptions(url), function(res) {
    console.log('STATUS: ' + res.statusCode);
    //if it's not success wait a bit
    if(res.statusCode.indexOf("20") != 0){
        consecutiveErrorCount++;
        setTimeout(urlToHttpRequest(url),consecutiveErrorCount * 60*1000);
    }
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (data) {
      consecutiveErrorCount = 0;  
      dataCount++;
      //console.log("Origin Data: " + data);
      for (i in responseStreams) {
        var stream = responseStreams[i];
        if (stream == null) {
          continue;
        }
        var writeResult = responseStreams[i].write(data, 'binary');
        if (writeResult) {
          recordSuccessfulWrite(i);
        }
        else {
          recordFailedWrite(i);
        }
        if (dataCount % 100 == 0) {
          console.log("DataCount: " + dataCount + "  listener " + i + " is writable: " + responseStreams[i].writable + ". WriteResult: " + writeResult + "  consecutiveFails: " + consecutiveFailedWrites[i]);
        }
      }
    });
  });

  req.on('error', function(ex) {
    //in the case of a network error just have a short break.
    console.log("Origin error: " + ex.message);
    var t = pow(10,consecutiveErrorCount)*1000;
    console.log("Trying again in:" + t);
    consecutiveErrorCount++;
    setTimeout(urlToHttpRequest(url),t);
  });
  req.on('end', function() {
    console.log("Origin end");
  });
  if (postData) {
    console.log("Writing POST data: " + postData);
    req.write(postData + "\n\n");
  }
  else {
    console.log("Not writing POST data");
  }
  req.end();
  return req;
}

function serverCallback(request, response) {
  console.log("Got a new listener");
  request.on('end', function() { console.log("request end: " + request) });
  request.on('close', function() { console.log("request close: " + request) });
  addListener(response, request);
}

function addListener(writeStream, request) {
  var index = responseStreams.length;
  var name = "listener" + index;
  writeStream.on('end', function() { console.log("writeStream end: " + name) });
  writeStream.on('close', function() { console.log("writeStream close: " + name) });
  writeStream.on('error', function(ex) { console.log("writeStream error: " + name + " ex: " + ex) });
  writeStream.on('drain', function() { recordSuccessfulWrite(index); });
  responseStreams[index] = writeStream;
  recordSuccessfulWrite(index);
  if (request) {
    request.on('close', function() { 
      console.log("Request for " + name + " was closed. Evicting.");
      responseStreams[index] = null;
    });
  }
}

addListener(logStream, false);
console.log("Creating server listening on " + serverPort);
var server = http.createServer(serverCallback);
server.listen(serverPort);
server.on('close', function(errno) { console.log("Server close: " + errno) } );
server.on('clientError', function(exception) { console.log("Server clientError: " + exception) } );

urlToHttpRequest(urlToSplit);
