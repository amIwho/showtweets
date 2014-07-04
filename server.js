var fs = require('fs'),
    http = require('http'),
    connect = require('connect'),
	url = require("url"),
	logger = require("morgan"),
	static = require("serve-static"),
	urlrouter = require('urlrouter'),
	request = require('request'),
	OAuth2 = require('oauth').OAuth2;

var secret, access_token;	

fs.readFile(__dirname + '/secret.json', 'utf8', function(err, data) {
	if (err) {
		console.log("Error: " + err);
		return;
	}
	
	secret = JSON.parse(data)[0];
	var oauth2 = new OAuth2(secret.key, secret.secret_key, 'https://api.twitter.com/', null, 'oauth2/token', null);
	
	oauth2.getOAuthAccessToken('', {
		'grant_type': 'client_credentials'
	  }, function (e, token) {
			console.log(e, token);
		  access_token = token;
	});
})



	
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
				},
				headers: {
					Authorization: "Bearer " + access_token
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
