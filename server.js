var fs = require('fs'),
    http = require('http'),
    connect = require('connect'),
	url = require("url"),
	logger = require("morgan"),
	static = require("serve-static"),
	urlrouter = require('urlrouter'),
	request = require('request');
	
	
var app = connect()
	.use(logger('dev'))
    .use(static('app'))
	.use(urlrouter(function(app) {
		app.get("/", function(req, res, next) {
			res.end("Ok!");
		});
		app.get(/^\/tweets\/([a-z]+)$/, function(req, res, next) {
			var username = req.params[0];
			options = {
				protocol: "https",
				host: "api.twitter.com",
				pathname: '/1.1/statuses/user_timeline.json',
				query: {
					screen_name: username, count: 10
				}
			};
			var reqUrl = url.format(options);
			console.log("reqUrl", reqUrl);
			request(reqUrl, function(err, res, body) {
				var tweets = JSON.parse(body);
				console.log("tweets", tweets);
			});
		});
	}));
	
http.createServer(app).listen(8080, function() {
    console.log("listening on 8080");
});