var appAnimations = angular.module('appAnimations', []);

appAnimations.animation('.pulse', [function() {
	return {
		enter : function(element, done) {

		},
		leave : function(element, done) {

		},
		move : function(element, done) {

		},

		addClass : function(element, className, done) {
			jQuery(element).animate({
				fontSize: 18
			}, 150)
			.animate({
				fontSize: 14
			}, 150, done);
		},
		removeClass : function(element, className, done) {

			return function(isCancelled) {
				if(isCancelled) {
					jQuery(element).stop();
				}
			}
		}
	}
}]);

appAnimations.animation('.fade', [function() {
	return {
		enter : function(element, done) {
			element.css('opacity',0);
			jQuery(element).animate({
				opacity: 1
			}, done);

			return function(isCancelled) {
				if(isCancelled) {
					jQuery(element).stop();
				}
			}
		},
		leave : function(element, done) {
			element.css('opacity', 1);
			jQuery(element).animate({
				opacity: 0
			}, done);

			return function(isCancelled) {
				if(isCancelled) {
					jQuery(element).stop();
				}
			}
		},
		move : function(element, done) {
			element.css('opacity', 0);
			jQuery(element).animate({
				opacity: 1
			}, done);

			return function(isCancelled) {
				if(isCancelled) {
					jQuery(element).stop();
				}
			}
		},

		addClass : function(element, className, done) {
			element.css('opacity',1);
			jQuery(element).animate({
				opacity: 0
			}, 600, done);

			return function(isCancelled) {
				if(isCancelled) {
					jQuery(element).stop();
				}
			}
		},
		removeClass : function(element, className, done) {
			element.css('opacity', 0);
			jQuery(element).animate({
				opacity: 1
			}, 600, done);

			return function(isCancelled) {
				if(isCancelled) {
					jQuery(element).stop();
				}
			}
		}
	}
}]);