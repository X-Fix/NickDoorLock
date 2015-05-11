(function() {
	var app = angular.module('lock'),
		serverloc = 'http://localhost:3000',
		legitloc = 'https://door-lock-server.herokuapp.com'

	app.service('Db', ['$http', function($http) {

		var me = this;
		me.Whisper = function(method, route, reqData, callback) {
			var req = {
				method: method,
				url: legitloc + route,
				data: reqData
			}
			// Send request
			$http(req).
			success(function(data, status, headers) {
				callback(data, status, headers);
			}).
			error(function(data, status, headers) {
				if (data) {
					console.log("Error: " + data);
				}
				callback(data, status, headers);
			});
		}

		return me;
	}]);
})();