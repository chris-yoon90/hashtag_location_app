var appControllers = angular.module('appControllers', []);

appControllers.controller('MainPageCtrl', [
	'$scope', 
	'$rootScope', 
	'$timeout',
	'socket', 
	'mapService',
	'colorGenerator',
	function($scope, $rootScope, $timeout, socket, mapService, colorGenerator) {
		var colors = colorGenerator.generate_colors(10);

		var hashtaglist = [];
		var tempHashtags = [];

		$scope.gethashtags = function() {
			return tempHashtags;
		};

		socket.on('hashtaglist', function(hashtags) {
			console.log("updating hashtagcloud: " + new Date());
			hashtaglist = [];
			tempHashtags = [];
			hashtags.forEach(function(hashtag, i) {
				hashtaglist.push(hashtag._id);
				tempHashtags.push({id: hashtag._id, value: hashtag.value, color: colors[i]});
			});
			$rootScope.$broadcast('updateHashtagList', tempHashtags);
			//$scope.hashtags = tempHashtags;
		});
		
		socket.on('tweet', function(tweet) {
			if(tweet.hashtags.length === 0) {
				mapService.add(tweet.coordinates, null, '#000000');
			} else {
				tweet.hashtags.forEach(function(hashtag) {
					var index = hashtaglist.indexOf(hashtag);
					if(index !== -1) {
						mapService.add(tweet.coordinates, hashtag, colors[index]);
						$rootScope.$broadcast('pulseHashtag', hashtag);
					} else {

					}
				});
			}
		});
}]);