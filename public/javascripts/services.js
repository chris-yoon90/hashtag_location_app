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

appServices.factory('colorGenerator', [function() {
	//Idea from underscroe.js
	var shuffle = function(a) {
		var shuffled = [];
		var index = 0;
		a.forEach(function(value) {
			var rand = Math.floor(Math.random() * index++);
			shuffled[index-1] = shuffled[rand];
			shuffled[rand] = value;
		});
		return shuffled;
	};

	//From: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	var rgb_to_hex = function(rgb) {
		return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
	};

	//From: http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
	var hsv_to_rgb = function(h, s, v) {
		var h_i = Math.floor(h*6);
		var f = h*6 - h_i;
		var p = v*(1-s);
		var q = v*(1-f*s);
		var t = v*(1-(1-f)*s);
		switch(h_i) {
			case 0: 
				r = v; g = t; b = p;
				break;
			case 1:
				r = q; g = v; b = p;
				break;
			case 2:
				r = p; g = v; b = t;
				break;
			case 3:
				r = p; g = q; b = v;
				break;
			case 4:
				r = t; g = p; b = v;
				break;
			case 5:
				r = v; g = p; b = q;
				break;
		}
		return [Math.floor(r*256), Math.floor(g*256), Math.floor(b*256)];
	};

	var generate_colors = function(num) {
		var hues = [];
		var increment = 1/num;
		for(var i = 0; i <= 0.9; i+= increment) {
			hues.push(i);
		}
		var colors = [];
		shuffle(hues).forEach(function(hue) {
			var rgb = hsv_to_rgb(hue, 0.7, 0.9);
			colors.push(rgb_to_hex(rgb));
		});
		return colors;
	};

	return {
		generate_colors: generate_colors
	}

}]);