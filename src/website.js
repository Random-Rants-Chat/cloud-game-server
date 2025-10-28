var respondStaticPage = require("./static-page-handler.js");

function processRequest(req,res) {
	var url = decodeURIComponent(req.url);
	var urlsplit = url.split("/");
	
	//Just in case to add an API, then it would be here.
	
	//Else, just try to respond with a static page.
	respondStaticPage(req,res);
	return;
}

var web = {processRequest:processRequest};

module.exports = web;