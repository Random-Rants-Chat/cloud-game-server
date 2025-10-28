var ws = require("ws");
var URL = require("url");
var path = require("path");
var fs = require("fs");

var wss = new ws.WebSocketServer({ noServer: true }); //Serverless websocket server, to be used on HTTP server.

var variables = {}; //{id: {name: "value"}}

function isSafe(value) {
  //Undefined, null, and other things that can possibly cause errors would return false.
  //Anything else like booleans, numbers, and strings would return true.
  var types = ["boolean", "number", "string"];
  for (var type of types) {
    if (typeof value == type) {
      return true;
    }
  }
  return false;
}

wss.on("connection", (ws, request) => {
  var url = URL.parse(request.url);
  var pathname = url.pathname;
  ws.sID = undefined;
  ws.sSyncedVariables = {};
  ws.sSendVariables = function () {
    if (typeof ws.sID == "undefined") {
      return;
    }
    var vars = variables[ws.sID];
    if (vars) {
      //Make sure there is actually varibles to send
      var syncedVars = ws.sSyncedVariables;
      for (var name of Object.keys(vars)) {
        if (vars[name] !== syncedVars[name]) {
          var value = vars[name];
          syncedVars[name] = value;
          ws.send(
            JSON.stringify({
              command: "update",
              name: name,
              value: value,
            })
          );
        }
      }
    }
  };
  ws.on("message", (data) => {
    try {
      //Put a try catch in case of hack attempt.
      var dataText = data.toString();
      var json = JSON.parse(dataText);

      if (json.command == "changeID") {
        if (typeof ws.sID == "undefined") {
          ws.sID = json.id; //Set the new id.
        } else {
          ws.sSyncedVariables = {}; //Delete synced variables, this would cause a bunch of websocket messages flowing to update messages.
          ws.sID = json.id; //Set the new id.
        }
        return;
      }

      if (typeof ws.sID == "undefined") {
        return; //Cant do anything with variables because of no sID property.
      }

      if (json.command == "setVariable") {
        var varName = "";
        var varValue = "";
        var id = ws.sID;
        if (isSafe(json.value)) {
          varName = json.name;
        } else {
          return;
        }
        if (isSafe(json.value)) {
          varValue = json.value;
        } else {
          return;
        }
        if (!variables[id]) {
          variables[id] = {};
        }
        variables[id][varName] = varValue;
        ws.sSyncedVariables[varName] = varValue; //Websockets should keep track of there own variables.
        return;
      }
    } catch (e) {
      //Instantly close the connection because of bad JSON.
      ws.close();
    }
  });

  ws.send(JSON.stringify({ command: "ready" }));
});

function sendUpdateMessages() {
  for (var ws of wss.clients) {
    ws.sSendVariables(); //Execute added property.
  }
}

setInterval(sendUpdateMessages, 10);

module.exports = {
  websocketServerlessServer: wss,
};
