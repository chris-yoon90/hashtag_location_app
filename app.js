
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var async = require('async');

var app = express();

var clearDb = function() {
  for(var a = 0; a < arguments.length; a++) {
      arguments[a].remove({}, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("Removed all docs.");      
      }
    });
  }
};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Database setup
var mongoose = require('mongoose');
var HashtagCount = require('./models/HashtagCount.js');
var TweetObject = require('./models/TweetObject.js');
mongoose.connect('mongodb://localhost/test_environment');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
  console.log('Connected to mongodb database');
  clearDb(HashtagCount, TweetObject);
});

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
	console.log("Socket connected.");
	var mapReduce = require('./mapReduce.js')(HashtagCount, TweetObject, socket, async);
	mapReduce();
	setInterval(mapReduce, 1000*5);
});

//Tweet Streaming
(function() {
	var credentials = require('./credentials.js');

	//Twitter streaming
	var Twit = require('twit');
	var T = new Twit({
	   consumer_key:         credentials.adhoc_twitter_access.consumer_key,
	   consumer_secret:      credentials.adhoc_twitter_access.consumer_secret,
	   access_token:         credentials.adhoc_twitter_access.access_token,
	   access_token_secret:  credentials.adhoc_twitter_access.access_token_secret
	});

	var stream = T.stream('statuses/filter', {locations: [-167.98675, 18.25365, -55.1352, 69.0777], language: 'en'});

	stream.on('tweet', function(tweet) {
		if(tweet.entities.hashtags.length > 0) {

			var hashtags = [];
			var user_mentions = [];
			tweet.entities.hashtags.forEach(function(h) {
				hashtags.push(h.text.toLowerCase());
				HashtagCount.create({hashtag: h.text.toLowerCase()}, function(err, hashtag) {
					if(err) {
						console.log(err);
					}
				});
			});

			tweet.entities.user_mentions.forEach(function(u) {
	        	user_mentions.push(u.screen_name.toLowerCase());
	        });

	    	console.log("tweet ID: " + tweet.id 
	    		+ " at: " + tweet.created_at 
	        	+ " with message: " + tweet.text
	        	+ " from: " + (tweet.coordinates ? 
	            	[tweet.coordinates.coordinates[0], tweet.coordinates.coordinates[1]] : undefined)
	    		+ " hashtags: " + hashtags
	    		+ " user_mentions: " + user_mentions);

	    	TweetObject.create({
	    		id: tweet.id, 
          		createdAt: new Date(tweet.created_at), 
          		message: tweet.text, 
          		coordinates: tweet.coordinates ? 
              		[tweet.coordinates.coordinates[0], tweet.coordinates.coordinates[1]] : undefined,
          		hashtags: hashtags,
          		user_mentions: user_mentions
	    	}, function(err, tweet) {
	    		if(err) {
	    			console.log(err);
	    		} else {

	    		}
	    	});

	    }

	});

})();