exec-stream
===========

[![Greenkeeper badge](https://badges.greenkeeper.io/sidorares/exec-stream.svg)](https://greenkeeper.io/)

create read-write stream from child process stdin/stdout

    var execStream = require('exec_stream');
    var find = execStream('find', ['/']);
    var nc = execStream('nc', ['localhost', '1212']);
    find.pipe(nc);
