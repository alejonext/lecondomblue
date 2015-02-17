var routes = require('../json/routes.json').user;

module.exports = function($routeProvider, $locationProvider, $httpProvider, SESSION) {
	$locationProvider.html5Mode(true);
	$locationProvider.hashPrefix = '!';
	$httpProvider.defaults.withCredentials = true;
	$routeProvider
		.when('/fqa',{
			templateUrl : '/' + SESSION + '.fqa'
		})
		.when('/privacidad',{
			templateUrl : '/' + SESSION + '.priva'
		})
		.when('/terminos',{
			templateUrl : '/' + SESSION + '.terms'
		})
		.when('/contacto',{
			templateUrl : '/' + SESSION + '.contact'
		})
		.when('/generar/:id',{
			templateUrl : '/' + SESSION + '.generar',
			controller : 'generar'
		})
		.when('/auth/:name',{
			templateUrl : '/' + SESSION + '.redirect',
			controller : 'login'
		})
		.when('/orden',{
			templateUrl : '/' + SESSION + '.orden',
			controller : 'ordene'
		})
		.when('/',{
			templateUrl : '/' + SESSION + '.see'
		});
};

module.exports.$inject = [ '$routeProvider', '$locationProvider', '$httpProvider', 'SESSION' ];
