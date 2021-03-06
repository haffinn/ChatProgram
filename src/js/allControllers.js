var ChatClient = angular.module('ChatClient', ['ngRoute']);
 
ChatClient.config(
	function ($routeProvider) {
		$routeProvider
			.when('/login', { templateUrl: 'src/Views/login.html', controller: 'LoginController' })
			.when('/rooms/:user/', { templateUrl: 'src/Views/rooms.html', controller: 'RoomsController' })
			.when('/room/:user/:room/', { templateUrl: 'src/Views/room.html', controller: 'RoomController' })
			.otherwise({
	  			redirectTo: 'login'
			});
	}
);
 
ChatClient.controller('LoginController', function ($scope, $location, $rootScope, $routeParams, socket) {
	
	$scope.errorMessage = '';
	$scope.nickname = '';
 
	$scope.login = function() {			
		if ($scope.nickname === '') {
			$scope.errorMessage = 'Please choose a nick-name before continuing!';
		} else {
			socket.emit('adduser', $scope.nickname, function (available) {
				if (available) {
					$location.path('/rooms/' + $scope.nickname);
				} else {
					$scope.errorMessage = 'This nick-name is already taken!';
				}
			});			
		}
	};
});
 
ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {
	//TODO: Fá users online til að update-ast automatically
	//TODO: Fá private message til að virka
	$scope.rooms = [];
	$scope.currentUser = $routeParams.user;
	$scope.roomname = '';
	$scope.message = '';
	$scope.users = [];

	//prvt messages
	$scope.prvtMessages = [];
	$scope.prvtMessage = '';
	$scope.prvtMessageTo = '';

	$scope.submitPrvtMsg = function() {
	 	if($scope.prvtMessage !== '') {
	 		socket.emit('privatemsg', {nick: $scope.prvtMessageTo, message: $scope.prvtMessage, from: $scope.currentUser}, function (available) {
				if (available) {
					$scope.prvtMessages.push({nick: $scope.currentUser, message: $scope.prvtMessage});
					$scope.prvtMessage = '';
					var chat = $(".prvt-chat-content")[0].scrollHeight;
					$(".prvt-chat-content").scrollTop(chat);
				} else {
					$scope.errorMessage = 'This user does not exist!';
				}
			});		
			
	 	}			
    };

    $scope.joinARoom = function(roomCalled) {
    	console.log("Join a room called. Room requested is %" + roomCalled + "%");
    	socket.emit('joinroom', { room: roomCalled }, function(success, reason) {
		    if (reason === "banned") {
		    	$scope.errorMessage = 'Join failed - You are banned!';
		    	console.log("Join failed - You are banned!");
		    }
		    if (!success) {
		        $scope.errorMessage = reason;
		        console.log(reason);
		    }
		    else {
		        $location.path('/room/' + $scope.currentUser + '/' + roomCalled);
		    }
		});
    };

    socket.on('recv_privatemsg', function(sender, msgReceived){
    	$scope.prvtMessages.push({nick: sender, message: msgReceived});
    	console.log("You got a message from:");
    	console.log(sender);
    	console.log("msg: ");
    	console.log(msgReceived);
    	var chat = $(".prvt-chat-content")[0].scrollHeight;
			$(".prvt-chat-content").scrollTop(chat);
    });

	socket.emit('users');
	socket.on('userlist', function (userList) {
		$scope.users = userList;
	});

// Var að reyna að gera þetta til að fá users online til að update-ast
//	socket.on('updateusers', function (roomName, users, ops){ 
//				console.log("users: ");
//				console.log(users);
//				$scope.users = users;
//	});	

    $scope.newRoom = function() {
    	if ($scope.roomname === '') {
			$scope.errorMessage = 'Please enter a name for the new room';
		} else {
			$scope.rooms.push($scope.roomname);

        	socket.emit('joinroom', { room: $scope.roomname }, function(success, reason) {
		    if (!success) {
		        $scope.errorMessage = reason;
		    }
		    else {
		        $location.path('/room/' + $scope.currentUser + '/' + $scope.roomname);
		    }
		});
		}
    };	

    socket.emit('rooms');
	socket.on('roomlist', function (rooms){
		$scope.rooms = Object.keys(rooms);
	});

	$scope.discon = function() {
		socket.emit('logout');
		$location.path("/login");
	};
 
});
 
ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.opperators = [];
	$scope.errorMessage = '';
	$scope.successMessage = '';
	$scope.message = '';
	$scope.messages = [];
	$scope.userToKickBanOp = '';
	$scope.banList = [];
	$scope.userToUnban = '';

	$scope.submitMsg = function() {
		if($scope.message !== '') {
	 		socket.emit('sendmsg', {roomName: $scope.currentRoom, msg: $scope.message});
			$scope.message = '';
		}			
	};

	$scope.goBack = function() {

		socket.emit('partroom', $scope.currentRoom);
		$location.path('/rooms/' + $scope.currentUser);
	};

	$scope.discon = function() {
		//socket.emit('partroom', $scope.currentRoom);
		socket.emit('logout');
		$location.path("/login");
	};

	$scope.kickUser = function() {
		socket.emit('kick', {user: $scope.userToKickBanOp, room: $scope.currentRoom }, function (success) {
			if (success) {
				// Show success message
				$scope.successMessage = 'Succeccfully kicked user' + $scope.userToKickBanOp;
				console.log("Succeccfully kicked user: " + $scope.userToKickBanOp);
			} else {
				// show fail message
				$scope.errorMessage = 'Failed to kick user';
				console.log("Failed to kick user: " + $scope.userToKickBanOp);
			}
			//$scope.userToKickBanOp = '';
		});
	};

	$scope.banUser = function() {
		socket.emit('ban', {user: $scope.userToKickBanOp, room: $scope.currentRoom}, function (success) {
			if (success) {
				$scope.successMessage = 'Successfully banned user ' + $scope.userToKickBanOp;
				console.log("Successfully banned user: " + $scope.userToKickBanOp);
			} else {
				$scope.errorMessage = 'Failed to ban user ' + $scope.userToKickBanOp;
				console.log("Failed to ban user: " + $scope.userToKickBanOp);
			}
		});
	};

	$scope.unBanUser = function() {
		socket.emit('unban', {user: $scope.userToUnban, room: $scope.currentRoom}, function (success) {
			if (success) {
				$scope.successMessage = 'Successfully unbanned ' + $scope.userToUnban;
			} else {
				$scope.errorMessage = 'Failed to ban user ' + $scope.userToUnban;
			}
			$scope.userToUnban = '';
		});
    	
    };

	$scope.opUser = function() {
		socket.emit('op', {user: $scope.userToKickBanOp, room: $scope.currentRoom}, function (success) {
			if (success) {
				$scope.successMessage = 'Successfully made ' + $scope.userToKickBanOp + ' admin';
				console.log("Successfully made " + $scope.userToKickBanOp + " admin");
			} else {
				$scope.errorMessage = 'Failed to make ' + $scope.userToKickBanOp + ' admin';
				console.log("Failed to make " + $scope.userToKickBanOp + " admin");
			}
			//$scope.userToKickBanOp = '';
		});
	};

	$scope.deOpUser = function() {
		socket.emit('deop', {user: $scope.userToKickBanOp, room: $scope.currentRoom}, function (success) {
			if (success) {
				$scope.successMessage = 'Successfully revoked admin for ' + $scope.userToKickBanOp;
			} else {
				$scope.errorMessage = 'Failed to revoke admin for ' + $scope.userToKickBanOp;
			}
		});
	};

	socket.on('kicked', function (room, user) {
		if (user === $scope.currentUser) {
			$location.path('/rooms/' + $scope.currentUser);
			$scope.errorMessage = 'You have been kicked from ' + $scope.currentRoom;
			console.log("You have been kicked from " + $scope.currentRoom);
		}
		else if (room === $scope.currentRoom) {
			$scope.successMessage = user + ' has been kicked from ' + room;
			console.log(user + " has been kicked from " + room);
		}
	});

	socket.on('banned', function (room, user) {
		if (user === $scope.currentUser) {
			$location.path('/rooms/' + $scope.currentUser);
			$scope.errorMessage = 'You have been banned from ' + $scope.currentRoom;
			console.log("You have been banned from " + $scope.currentRoom);
		}
		else if (room === $scope.currentRoom) {
			$scope.successMessage = user + ' has been banned from ' + room;
			console.log(user + " has been banned from " + room);
		}
	});

	socket.on('updateusers', function (roomName, users, ops) {
		if(roomName === $scope.currentRoom) {
			console.log("opperators:");
			// console log test:
			var oplist = [];
			for(var op in ops) {
				oplist.push(op);
			}
			console.log(oplist);
			
			$scope.currentUsers = users;
			$scope.opperators = ops;
		}
	});		
 
	socket.emit('joinroom', {room: $scope.currentRoom}, function (success, reason) {
		if (!success) {
			$scope.errorMessage = reason;
		}
	});

    socket.on('updatechat', function (roomName, messageHistory) {
		//pushes all current messages to the messages array to be displayed
		//Hugsanlegt TODO: Passa að roomName passi
		if ($scope.currentRoom === roomName) {
			$scope.messages = messageHistory;
			var chat = $(".chat-content")[0].scrollHeight;
			$(".chat-content").scrollTop(chat);
		}
    });

	$scope.submitMsg = function() {
	 	if($scope.message !== '') {
	 		socket.emit('sendmsg', {roomName: $scope.currentRoom, msg: $scope.message});
			$scope.message = '';
	 	}			
    };
});


