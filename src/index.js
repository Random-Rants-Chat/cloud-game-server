var ws = require("ws");
var http = require("http");
var URL = require("url");

var web = require("./website.js"); //Stuff to the HTTP/HTTPS (the website pages and such) api then it would be in website.js commonly.
var cloud = require("./cloud.js"); //Stuff to the websocket/cloud server (the cloud variable storage and updates) would be in cloud.js commonly.
var wss = cloud.websocketServerlessServer; //Its a server... I guess??? Its not sent to a port so we can just "inject" it to the http server.

var server = http.createServer(web.processRequest);

server.on("upgrade", function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("connection", ws, request);
  });
});

server.listen(8080 || process.env.port); //Port 8080 by default