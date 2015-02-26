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



