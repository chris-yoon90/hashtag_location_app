var app = angular.module('hashtagapp', [
	'ngRoute', 
	'ngAnimate',
	'appControllers', 
	'appDirectives',
	'appServices',
	'appAnimations']);

app.config(['$routeProvider','$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {
		templateUrl: 'partials/main-page.ejs',
		controller: 'MainPageCtrl'
	}).otherwise({
		redirectTo: '/'
	});
	$locationProvider.html5Mode(true);
}]);