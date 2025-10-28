var mimeTypes = require("./mime-types.js");
var URL = require("url");
var fs = require("fs");
var path = require("path");

function setNoCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
}

function respondStaticPage(req, res, otheroptions) {
  var url = URL.parse(req.url);
  var pathname = decodeURIComponent(url.pathname);

  setNoCorsHeaders(res);

  var file = path.join("./public/", pathname);
  if (file.split(".").length < 2) {
    var _lastfile = file.toString();
    file += ".html";
    if (!fs.existsSync(file)) {
      file = path.join(_lastfile, "/index.html");
    }
  }

  if (!fs.existsSync(file)) {
    file = "errors/404.html";
    res.statusCode = 404;
  }
  if (otheroptions) {
    if (typeof otheroptions.status == "number") {
      file = "errors/" + otheroptions.status + ".html";
      res.statusCode = otheroptions.status;
    }
  }
	
  var extension = file.split(".").pop().toLowerCase();
  
  var mime = mimeTypes[extension];
  if (mime) {
    res.setHeader("content-type", mime);
  }
  if (extension == "html" || extension == "js") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(fs.readFileSync(file, { encoding: "utf-8" }));
  } else {
    fs.createReadStream(file).pipe(res);
  }
}

module.exports = respondStaticPage;