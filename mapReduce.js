var mapReduce = function(HashtagCount, TweetObject, socket, async) {
	var reduce = function() {
		var o = {};
		o.map = function() {
			emit(this.hashtag, 1);
		}
		o.reduce = function(k, vals) {
			return vals.length;
		}
		o.out = { replace: 'hashtagCollection'}

		HashtagCount.mapReduce(o, function(err, results) {
			var dateNow = Date.now;
			results.find().sort({value: 'desc'}).where('value').gt(0).limit(10).exec(function(err, docs) {
				if(err) {
					console.log(err);
				} else {
					console.log(docs);
					socket.emit('hashtagcloud', docs);
					var iterator = function(item, callback) {
						TweetObject.find({hashtags: {$in: [item._id]}}, function(err, queryResults) {
							if(err) {
								console.log(err);
							} else {
								var topic = {
									tweets: queryResults,
									hashtag: item._id,
									centers: []
								}
								callback(err, topic);
							}
						});
					}

					async.concatSeries(docs, iterator, function(err, events) {
						if(err) {
							console.log(err);
						} else {
							socket.emit('hashtagmap', events);
							/*events.forEach(function(e) {
								console.log("saved Event: " + e.hashtag);
							});*/
						}
					});



				}
			});
		});
	};
	return reduce;
};

module.exports = mapReduce;