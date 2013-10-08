var connect = require('connect');
connect.createServer(
  connect.static(__dirname)
).listen(8080);

console.log("Templates server listening on localhost:8080");
