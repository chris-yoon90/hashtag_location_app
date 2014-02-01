var colors = [
	'#FF0000', 
	'#02BC02', 
	'#0080FF', 
	'#CBC700', 
	'#00FFFF', 
	'#FF00FF', 
	'#808080', 
	'#FF8080', 
	'#67FF67', 
	'#8080FF' 
];

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