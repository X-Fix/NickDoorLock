(function() {
	var app = angular.module('log', [ ]);

	app.controller('LogController',['$http', function($http) {
		this.verify = function() {

			var req = {
				method: 'POST',
				url: 'http://door-lock-server.herokuapp.com/',
				data: {
					user: this.user,
					pword: this.pword
				}
			}
			$http(req).
			success(function(data, status, headers, config) {
				if (data) {
					window.location = data;
				}
			}).
			error(function(data, status, headers, config) {
				console.log("error connecting to server: " + data);
			});
		};
	}]);
})();