var zlib = require('zlib');
var execStream = require('./index.js');

// not a real, chainable stream
function bufferStream(onend)
{
    if (!(this instanceof bufferStream)) {
       return new bufferStream(onend);
    }
    this.buf = '';
    this.write = function(chunk) { this.buf += chunk.toString() }
    this.end = function() { onend(this.buf); }
    // emulate EE
    this.on = function(sig) {}
}

var gzip = zlib.createGzip();
var gunzip = execStream('gunzip');
var echo = execStream('echo', ['1', '2', '3']);
echo.pipe(gzip).pipe(gunzip).pipe(bufferStream(console.log));
