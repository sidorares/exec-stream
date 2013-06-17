var execStream = require('../index.js');
var gunzip = execStream('gunzip');
var gzip = execStream('gzip');
var find = execStream('find', ['/']);
find.pipe(gzip1).pipe(gunzip).pipe(process.stdout, { end: false });
