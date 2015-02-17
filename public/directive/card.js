module.exports = function () {
	return {
		restrict: 'A',
		scope : {
			status : '='
		},
		link : function (scope, elem, attrs) {
			var lis = angular.element(elem).children('li');
			var total = lis.length - 1;

			scope.$watch('status', function (newVal) {
				var newVal = newVal || 0;

				if( total < newVal )
					elem.addClass('endForm');

				for (var i = total; i >= 0; i--){
					var li = angular.element(lis[i]);
					if( total < newVal ){
						li.removeClass('hide');
						li.removeClass('edit');
					} else {
						if( li.hasClass('hide') && newVal === i ){
							li.removeClass('hide');
						} else if( newVal != i && !li.hasClass('hide') ) {
							li.addClass('hide');
						}
					}	
				}
			});
		}
	};
};

module.exports.$inject = [ ];