var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;
module.exports = function(cmd, args) {
   var self = new EventEmitter;
   var child = spawn(cmd, args);
   self.pause = function() {
       if (self.paused)
           return;
       child.kill('SIGTSTP');
       self.paused = true;
   };
   self.resume = function() {
       child.kill('SIGCONT');
       self.paused = false;
   }
   child.stdout.on('data', function(data) {
       console.log('emitting: ', data.toString());
       self.emit('data', data); // self.emit.bind(self, 'data') ???
   });
   child.on('exit', function(code, signal) {
       if (code === 0)
           self.emit('end');
       //else
       //    console.log(code, signal);
   });
   self.write = function(data) {
       console.log('write called: ', data.toString());
       return child.stdin.write(data);
   }
   child.stdin.on('drain', function() {
       self.emit('drain');
   });
   self.end = function() {
       child.kill('SIGKILL');
   };
   self.pipe = function(dest, opts) {
       dest.on('drain', function() {
           if (self.paused)
               self.resume();
       });
       self.on('data', function(data) {
           var buffered = dest.write(data);
           if (buffered)
               self.pause();
       });
       self.on('end', function() {
           dest.end();
       });
       self.emit('pipe');
       return dest;
   };
   return self;
}
