var colors = [
	'#FF0000', 
	'#00FF00', 
	'#0080FF', 
	'#E6E601', 
	'#00FFFF', 
	'#FF00FF', 
	'#808080', 
	'#FF8080', 
	'#80FF80', 
	'#8080FF' 
];

var app = angular.module('hashtagapp', ['ngAnimate']);

app.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if(callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});

app.factory('mapService', function() {
	var map = L.map('map').setView([55, -100], 3);

	L.tileLayer('http://{s}.tile.cloudmade.com/d65c54c0239145d689cc3ad2f84b9c0d/22677/256/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com" target="_blank">CloudMade</a>',
		maxZoom: 15,
		minZoom: 2
	}).addTo(map);

	var fadeout = function(marker, hashtag, fadeTime) {
		var op = 0.5;
		var fillop = 1;
		var op_decrement = op/((fadeTime >= 50 ? fadeTime : 50)/50);
		var fillop_decrement = fillop/((fadeTime >= 50 ? fadeTime : 50)/50);
		var timer = setInterval(function() {
			op -= op_decrement;
			fillop-= fillop_decrement;
			if(op <= 0) {
				clearInterval(timer);
				map.removeLayer(marker);
			}
			marker.setStyle( {
				opacity: op,
				fillOpacity: fillop
			});
			if(hashtag) {
				marker.getLabel().setOpacity(fillop);
			}
			marker.redraw();
		}, 50);
	};

	return {
		add: function(coordinates, hashtag, color) {
			var marker = L.circleMarker([coordinates[1], coordinates[0]], {
    			color: color,
    			opacity: 0.5,
    			fillOpacity: 1,
    			radius: 3
			});
			if(hashtag) {
				marker.bindLabel(hashtag, {noHide: true } );
			}
			marker.addTo(map);
			fadeout(marker, hashtag, 2000);
		}
	}
});


app.controller('MapController', function($scope, socket, mapService) {
	/*socket.on('hashtagmap', function(events) {
		if(events.length !== 0) {
			$scope.events = events;
			events.forEach(function(anEvent, i) {
				anEvent.tweets.forEach(function(tweet) {
					if(tweet.coordinates && tweet.coordinates.length > 0) {
						mapService.add(tweet.coordinates[1], tweet.coordinates[0], colors[i]);
					}
				});
			});
		}
	});*/
	var hashtaglist = [];
	
	socket.on('hashtagcloud', function(hashtags) {
		hashtaglist = [];
		hashtags.forEach(function(hashtag) {
			hashtaglist.push(hashtag._id);
		});
	});
	
	socket.on('tweet', function(tweet) {
		if(tweet.hashtags.length === 0) {
			mapService.add(tweet.coordinates, null, '#000000');
		} else {
			tweet.hashtags.forEach(function(hashtag) {
				var index = hashtaglist.indexOf(hashtag);
				if(index !== -1) {
					mapService.add(tweet.coordinates, hashtag, colors[index]);
				} else {

				}
			});
		}
	});
	
});

app.controller('HashtagCloudController', function($scope, socket, $timeout) {

	$scope.show = false;
	
	socket.on('hashtagcloud', function(hashtags) {
		console.log("updating hashtagcloud: " + new Date());
		$scope.show = false;
		var tempHashtags = [];
		hashtags.forEach(function(hashtag, i) {
			tempHashtags.push({id: hashtag._id, value: hashtag.value, color: colors[i]});
		});
		$timeout(function() {
			$scope.hashtags = tempHashtags;
			$scope.show = true;
		},600);
	});
});