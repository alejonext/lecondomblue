module.exports = function (scope, params) {
	scope.status = 0;
	//scope.product = product({ id :  params.id });

	scope.next = function () {
		scope.status++;
	};

	scope.goTo = function (i) {
		if(i < scope.status )
			scope.status = i;
	};

};

module.exports.$inject = [ '$scope', '$routeParams' ];
