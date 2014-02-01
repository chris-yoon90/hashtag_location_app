var appServices = angular.module('appServices', []);

appServices.factory('socket', ['$rootScope', function($rootScope) {
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
}]);

appServices.factory('mapService', [function() {
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
				marker.bindLabel(hashtag, {noHide: true, direction: 'auto' } );
			}
			marker.addTo(map);
			fadeout(marker, hashtag, 2000);
		}
	}
}]);