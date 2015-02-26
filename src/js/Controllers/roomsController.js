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
 
