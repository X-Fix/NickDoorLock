(function() {
	var app = angular.module('lock', [ ]);

	var buttonDisable = function (button, string) {
		button.disabled = true;
		button.value = string;
	}

	var buttonEnable = function (button, string) {
		button.disabled = false;
		button.value = string;
	}

	app.controller('PageController', function() {
		this.page = 2;

		this.setCurrent = function(page) {
			this.page = page;
		};

		this.isCurrent = function(page) {
			return this.page === page;
		};
	});

	app.controller('UserController', ['Db', function (Db) {
		var self = this;
		self.users = [];
		self.newUser = {
			_id: '',
			username: '',
			password: '',
			adminLvl: '2',
			cardNo: '',
			showForm: false
		};

		this.getAll = function() {
			// Get Refresh button object
			var button = document.getElementById("refreshButton");
			// Give feedback for button click
			buttonDisable(button, "Refreshing...");

			Db.Whisper('GET', '/all', null, function (data, status) {
				if (status == 200) {
					self.users = data;
				}
				else {
					console.log("getAll method error; Status Code: " + status);
				}
				// Revert to normal button
				buttonEnable(button, "Refresh");
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
		}

		this.setEditAdmin = function(user, bool) {
			user.editAdmin = bool;
		}

		this.setEditCard = function(user, bool) {
			user.editCard = bool;

			if (bool) {
				var staleValue = user.cardNo;
				user.cardNo = "Scan tag...";

				var reqData = {
					oldValue: staleValue
				}

				Db.Whisper('POST', '/tag', reqData, function (data, status) {
					switch (status) {
						case 200:
							console.log("response" + data);
							user.cardNo = data.substring(0, 10);
							break;
						default:
							user.cardNo = staleValue;
							window.alert("Error! Present tag or try again later.");
							console.log("Error: " + status + ":" + data);
					}
				});
			}
		}

		this.deleteUser = function(user, cb) {
			var reqData = {
				_id: user._id,
				deletedUser: user.username,
				currentUser: window.localStorage.getItem('user')
			}
			console.log(user._id);
			Db.Whisper('PUT', '/user', reqData, function (data, status) {
				switch (status) {
					case 204: 
						self.users.splice(self.users.indexOf(user), 1);
						window.alert("User Deleted!");
						break;
					case 400:
						window.alert("DB query not completed...");
						break;
					case 500:
						window.alert("Server error...");
						break;
					default:
						window.alert("Weird error, check logs.");
						console.log(status);
						console.log(data);
				}
			});
		}

		this.saveChange = function(user, column) {
			var reqData = {
				_id: user._id,
				updatedUser: user.username,
				currentUser: window.localStorage.getItem('user')
			}
			var URL = ''
			switch (column) {
				case "cardNo":
					reqData.cardNo = user.cardNo;
					URL = '/user/cardNo'
					break;
				case "adminLvl":
					reqData.adminLvl = user.adminLvl;
					URL = '/user/adminLvl'
					break;
				default:
					console.log("You done fucked up dude...");
					return null;
			}
			Db.Whisper('PUT', URL, reqData, function (data, status) {
				switch (status) {
					case 204:
						break;
					case 400: 
						window.alert("DB query not completed...");
						break;
					case 500: 
						window.alert("Server error...");
						break;
					default:
						window.alert("Weird error, check logs.");
						console.log(status);
						console.log(data);
				}
			});
		}

		this.saveNewUser = function() {
			// Add new user to DB
			var reqData = {
				_id: null,
				username: self.newUser.username,
				password: self.newUser.password,
				cardNo: self.newUser.cardNo,
				adminLvl: self.newUser.adminLvl,
				currentUser: window.localStorage.getItem('user')
			}

			Db.Whisper('POST', '/user', reqData, function (data, status) {
				switch (status) {
					case 201:
						reqData._id = data;
						self.users.push(reqData);
						alert("User added! Welcome, " + reqData.username + ".");
						break;
					case 400:
						alert("Invalid user submission. Please check fields for blanks");
						break;
					case 409:
						alert("DB error. Refresh page and/or try again later");
						break;
					case 500:
						alert("Server error...");
						break;
					default:
						alert("Weird error, check logs.");
				}
			});
		}

		this.setAddUser = function(bool) {
			self.newUser.showForm = bool;
			if (!bool) {
				window.scrollTo(0, 1000);
			}
		}

	}]);

	app.controller('DatabaseController',['Db', '$scope', function (Db, $scope) {
		$scope.limit = 10;
		$scope.begin = 0;
		var self = this;
		this.logIn = function() {
			var button = document.getElementById("logInButton");
			var currentUser = this.user
			var reqData = {
				message: "This worked!",
				username: currentUser,
				password: this.pword
			}
			buttonDisable(button, "Logging In...");
			Db.Whisper('POST', '/logIn', reqData, function (data, status, headers) {
				if (status == 200) {
					// Set token and username
					window.localStorage.setItem('token', headers('X-Token'));
					window.localStorage.setItem('user', currentUser);
					// Redirect to appropriate page
					window.location = data;
				}
				else {
					buttonEnable(button, "Log In");
					window.alert(status);
				}
			});
		}

		this.logOut = function() {
			// Get logOut button object
			var button = document.getElementById("logOutButton");
			// Build request object
			var reqData = {
					token: window.localStorage.getItem('token')
				}
			// Give feedback for button click
			buttonDisable(button, "Logging out...");

			// Tell server to log user out
			Db.Whisper('POST', '/logOut', reqData, function(data, status) {
				if (status == 200) {
					// Remove token
					window.localStorage.clear();
					// Redirect to Log In page
					window.location = data;
				}
				else {
					// Revert to normal button
					buttonEnable(button, "Log Out");
				}
			});
		};

		this.unlock = function() {
			// Get Unlock button object
			var button = document.getElementById("unlockButton");
			// Build request object
			var reqData = {
					token: window.localStorage.getItem('token'),
					currentUser: window.localStorage.getItem('user')
				}
			// Give feedback for button click
			buttonDisable(button, "Opening...");

			Db.Whisper('POST', '/door', reqData, function (data, status) {
				if (status == 200) {

				}
				else if (status == 500) {
					window.alert("Door chip offline");
				}
				else {
					alert("Illegal user!");
					window.location = "index.html";
				}
				buttonEnable(button, "Unlock!");
			});
		};

		this.fakeUnlock = function() {
			window.alert("Hakuna your tatas. We're working on it");
		}

		this.tokenCheck = function() {
			var token = window.localStorage.getItem('token');
			var reqData = {
					token: token
				};

			Db.Whisper('POST', '/verify', reqData, function (data, status) {
				if (status != 200) {
					window.location = "index.html";
				}
			});
		};

		this.getLog = function () {
			Db.Whisper('GET', '/logs', null, function (data, status) {
				self.logData = data.split('-');
			})
		};

		this.manualOverride = function() {
			var overrideCode = prompt("Enter the code");
			if (overrideCode != null) {
				var reqData = {
						code: overrideCode
					}

				Db.Whisper(reqData, function(response) {
					if (status == 200) {
						alert("Manual override successful");
					}
					else {
						alert("Server error...");
					}
				});
			};	
		};
	}]);
})();

jQuery(document).ready(function() {
	$("#List-Users").removeAttr("style");
	$("#Log-History").removeAttr("style");
});
	