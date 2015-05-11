(function() {
	var app = angular.module('lock', [ ]);

	app.controller('PageController', function() {
		this.page = 2;

		this.setCurrent = function(page) {
			this.page = page;
		};

		this.isCurrent = function(page) {
			return this.page === page;
		};
	});

	app.controller('LogController',['Db', function(Db) {
		this.verify = function() {
			var reqData = {
				purpose: 'logIn',
				username: this.user,
				password: this.pword
			}

			Db.Whisper(reqData, function(response) {
				if (response.reply) {
					// Set token
					window.localStorage.setItem('token', response.token);
					// Redirect to appropriate page
					window.location = response.loc;
				}
				else {
					window.alert(response.err);
				}
			});
		};

		this.ping = function() {
			Db.Ping();
		}
	}]);

	app.controller('UserController', ['Db', function(Db) {
		var self = this;
		self.newUser = {
			_id: '',
			username: '',
			password: '',
			adminLvl: '2',
			cardNo: '',
			showForm: false
		};

		this.getAll = function() {
			var reqData = {
					purpose: 'getAll'
				}

			Db.Whisper(reqData, function(response) {
				if (response.reply) {
					console.log(response.results);
					self.users = response.results;
				}
			});
		}

		this.initUser = function(user) {
			user.editAdmin = false;
			user.editCard = false;
		}

		this.initPage = function() {
			self.newUser = {
				_id: '',
				username: '',
				password: '',
				adminLvl: '2',
				cardNo: '',
				showForm: false
			};

			console.log(self.newUser);
			console.log(self.users);
		}

		this.setEditAdmin = function(user, bool) {
			user.editAdmin = bool;
		}

		this.setEditCard = function(user, bool) {
			user.editCard = bool;
		}

		this.deleteUser = function(user) {
			var reqData = {
				purpose: 'removeUser',
				_id: user._id
			}

			Db.Whisper(reqData, function(response) {
				if (response.reply) {
					window.alert("User Deleted!");
				}
			});
		}

		this.saveChanges = function(user, column) {
			// Update user on column where _id = user._id
		}

		this.saveNewUser = function() {
			// Add new user to DB
			var reqData = {
				purpose: 'addUser',
				username: self.newUser.username,
				password: self.newUser.password,
				cardNo: self.newUser.cardNo,
				adminLvl: self.newUser.adminLvl
			}

			Db.Whisper(reqData, function(response) {
				if (response.reply) {
				};
			});
		}

		this.setAddUser = function(bool) {
			self.newUser.showForm = bool;
			if (!bool) {
				window.scrollTo(0, 1000);
			}
		}

	}]);

	app.controller('DatabaseController',['Db', function(Db) {
		
		this.logIn = function() {
			// I'll get to this later
		}

		this.logOut = function() {
			// Build request object
			var reqData = {
					purpose: 'logOut',
					token: window.localStorage.getItem('token')
				}

			Db.Whisper(reqData, function(response) {
				if (response.reply) {
					window.localStorage.clear();
					window.location = response.loc;
				}
			});
		};

		this.unlock = function() {
			// Build request object
			var reqData = {
					purpose: 'openDoor',
					token: window.localStorage.getItem('token')
				}

			Db.Whisper(reqData, function(response) {
				if (response.reply) {
					window.alert("The door has been opened!");
				}
				else {
					alert("Illegal user!");
					window.location = "index.html";
				}
			});
		};

		this.fakeUnlock = function() {
			window.alert("Hakuna your tatas. Should be done by today/tomorrow");
		}

		this.tokenCheck = function() {
			var token = window.localStorage.getItem('token');
			console.log(token);
			var reqData = {
					purpose: 'checkUser',
					token: token
				}

			Db.Whisper(reqData, function(response) {
				if (!response.reply) {
					console.log("no token...");
					window.location = "index.html";
				}
			});
		};

		this.manualOverride = function() {
			var overrideCode = prompt("Enter the code");
			if (overrideCode != null) {
				var reqData = {
						purpose: 'authoriseOverride',
						code: overrideCode
					}

				Db.Whisper(reqData, function(response) {
					if (response.reply) {
						// Do something here
					}
					else {
						alert("Server error...");
					}
				});
			};	
		};
	}]);
})();
	