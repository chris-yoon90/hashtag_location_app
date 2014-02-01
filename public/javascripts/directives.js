var appDirectives = angular.module('appDirectives', []);

appDirectives.directive('pulseMe', ['$animate', '$timeout', 
	function($animate, $timeout) {
		return function(scope, element, attrs) {
			scope.$on('pulseHashtag', function(eventObject, hashtag) {
				if(attrs.pulseMe === hashtag) {
					$animate.addClass(element, '.pulse');
					$timeout(function() {
						$animate.removeClass(element, '.pulse');
					},500);
				}
			});
		}
}]);

appDirectives.directive('fadeMe', ['$animate', '$timeout',
	function($animate, $timeout) {
		return function(scope, element, attrs) {
			scope.$on('updateHashtagList', function(eventObject, hashtagList) {
				$animate.addClass(element, 'fade');
					$timeout(function() {
						$animate.removeClass(element, 'fade');
						scope.hashtags = hashtagList;
					}, 800);
			});
		}
}]);