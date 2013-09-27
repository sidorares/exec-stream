var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;
module.exports = function(cmd, args) {
   var self = new EventEmitter();
   var child = spawn(cmd, args);
   var pauserefcount = 0;
   var error = false;
   var connected = false;
   child.stdin.resume();
   child.stdout.resume();

   var doconnect = function() {
       if(! error && ! connected) {
           connected = true;
           self.emit("connect");
       };
   }
   setImmediate(doconnect);
   self.pause = function() {
       pauserefcount++;
       if (pauserefcount > 1)
          return;
       child.kill('SIGTSTP');
       self.paused = true;
   };
   self.resume = function() {
    console.log(cmd + '.resume');
       pauserefcount--;
       if (pauserefcount>0)
         return;
       if (pauserefcount<0)
         throw new Error('resume() is called without calling pause()');
       child.kill('SIGCONT');
       self.paused = false;
   };
   child.stdout.once("data", doconnect);
   child.stdout.on('data', function(data) {
       console.log(cmd + '.data', data);
       self.emit('data', data); // self.emit.bind(self, 'data') ???
   });
   child.once("exit", doconnect);
   child.on('exit', function(code, signal) {
       if (code === 0)
           self.emit('end');
       //else
       //    console.log(code, signal);
   });
   child.on("error", function(err) {
       error = true;
       //self.emit("error", err);
   });
   self.write = function(data) {
       console.log(cmd + '.write', data);
       return child.stdin.write(data);
   };
   child.stdin.once("drain", doconnect);
   child.stdin.on('drain', function() {
       self.emit('drain');
   });
   self.end = function() {
       child.kill('SIGINT');
   };
   self.pipe = function(dest, opts) {
       dest.on('drain', function() {
           if (self.paused)
               self.resume();
       });
       self.on('data', function(data) {
           var buffered = !dest.write(data);
           if (buffered & !self.paused)
               self.pause();
       });

       if (!opts || (opts && opts.end === true) || (opts && typeof opts.end === 'undefined'))
           self.on('end', function() {
               dest.end();
           });

       self.emit('pipe');
       return dest;
   };
   return self;
};
