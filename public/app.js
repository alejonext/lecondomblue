var rex = require("./json/routes.json");
var app = angular.module("blue", rex.require);
// Controladores
app.directive( 'status', require( './directive/card.js' ));
app.controller( 'generar', require( './controller/generar.js' ));
app.controller( 'login', require( './controller/login.js' ));
app.config(require("./service/config.js"));