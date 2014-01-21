var colors = [
	'#FF0000', 
	'#00FF00', 
	'#0000FF', 
	'#FFFF00', 
	'#00FFFF', 
	'#FF00FF', 
	'#808080', 
	'#FF8080', 
	'#80FF80', 
	'#8080FF' 
];

var app = angular.module('hashtagapp', []);

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

	var fadeout = function(marker, fadeTime) {
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
			marker.redraw();
		}, 50);
	};

	return {
		add: function(lat, long, color) {
			var marker = L.circleMarker([lat, long], {
    			color: color,
    			opacity: 0.5,
    			fillOpacity: 1,
    			radius: 2
			});
			marker.addTo(map);
			fadeout(marker, 1000);
		}
	}
});


app.controller('MapController', function($scope, socket, mapService) {
	socket.on('hashtagmap', function(events) {
		if(events.length !== 0) {
			$scope.events = events;
			events.forEach(function(anEvent, i) {
				anEvent.tweets.forEach(function(tweet) {
					if(tweet.coordinates.length > 0) {
						mapService.add(tweet.coordinates[1], tweet.coordinates[0], colors[i]);
					}
				});
			});
		}
	});
	
});

app.controller('HashtagCloudController', function($scope, socket) {
	socket.on('hashtagcloud', function(data) {
		$scope.hashtags = data;
	});
});