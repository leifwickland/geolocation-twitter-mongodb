var http = require('http');
var url = require('url');
var fs = require('fs');

if (process.argv.length < 5) {
  console.log("USAGE: " + process.argv[0] + " " + process.argv[1] +
              " <serverPort> <URL> <logFile> [postData]");
  process.exit(1);
}

var serverPort = process.argv[2];
var urlToSplit = url.parse(process.argv[3]);
var logPath = process.argv[4]
var postData = (process.argv.length > 5 ? process.argv[5] : "");
console.log(
  "Port: " + serverPort + 
  "   URL: " + urlToSplit.href + 
  "   LogPath: " + logPath + 
  "   PostData: " + postData);

var responseStreams = [];
var consecutiveFailedWrites = [];
var failureThreshold = 1000;
var logStream = fs.createWriteStream(logPath, { 
  flags: 'a+', encoding: null, mode: 0666 
});

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
  return options;
}

function recordFailedWrite(index) {
  if ((consecutiveFailedWrites[index] += 1) > failureThreshold) {
    responseStreams[index] = null;
    console.log("Evicted listener " + index + 
      " because it failed " + failureThreshold + " consecutive writes.");
  }
}

function recordSuccessfulWrite(index) {
  consecutiveFailedWrites[index] = 0;
}

function urlToHttpRequest(url) {
  var req = http.request(urlToHttpOptions(url), handleResponseFromOrigin);
  req.on('error', handleOriginError);
  if (postData) {
    req.write(postData + "\n\n");
  }
  req.end();
  return req;
}

function handleResponseFromOrigin(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  if(res.statusCode.toString().indexOf("20") != 0){
    scheduleOriginConnectionRetry(60 * 1000);
    return;
  }
  res.setEncoding('utf8');
  res.on('data', handleReceivedDataFromOrigin);
}

var consecutiveErrorCount = 0;
function handleReceivedDataFromOrigin(data) {
  consecutiveErrorCount = 0;  
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
  }
}

function scheduleOriginConnectionRetry(millis) {
  consecutiveErrorCount++;
  console.log("Errors: " + consecutiveErrorCount + 
              "  Trying again in:" + millis);
  setTimeout(function(){urlToHttpRequest(url)},millis);
}

function handleOriginError(ex) {
  //in the case of a network error just have a short break.
  console.log("Origin error: " + ex.message);
  var t = Math.pow(10,consecutiveErrorCount)*1000;
  scheduleOriginConnectionRetry(t)
}

function handleServerRequest(request, response) {
  console.log("Got a new listener");
  addListener(response, request);
}

function addListener(writeStream, request) {
  var index = responseStreams.length;
  var name = "listener" + index;
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
http.createServer(handleServerRequest).listen(serverPort);

urlToHttpRequest(urlToSplit);
