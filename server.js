var fs = require('fs'),
    http = require('http'),
    connect = require('connect'),
	url = require("url"),
	logger = require("morgan"),
	static = require("serve-static"),
	urlrouter = require('urlrouter'),
	request = require('request'),
	OAuth = require('oauth'),
	render = require('connect-render');

var secret, access_token;	

var secret = JSON.parse( fs.readFileSync(__dirname + '/secret.json'))[0];

var oauth = new OAuth.OAuth(
	'https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	secret.consumer_key, 
	secret.app_secret,
	'1.0A',
	null,
	'HMAC-SHA1'
);
	
var app = connect()
	.use(logger('dev'))
    .use(static('app'))
    .use(render({
	    root: __dirname,
	    layout: "layout.ejs",
	    cache: false
    }))
	.use(urlrouter(function(app) {
		app.get("/", function(req, res, next) {
			res.end("Usage: /tweets/:username !");
		});
		app.get(/^\/tweets\/([a-zA-Z]+)$/, function(req, res, next) {
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
			
			oauth.get(reqUrl, secret.user_token, secret.user_secret, function(err, data) {
				if (err, data, res) {
					console.error(err);
				}
				
				var tweets = JSON.parse(data);
				res.render('tweets.ejs', {tweets: tweets, name: username});
				
			}); 
		});
	}));
	
http.createServer(app).listen(8080, function() {
    console.log("listening on 8080");
});
