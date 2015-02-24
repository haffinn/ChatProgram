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
	$scope.rooms = [];
	$scope.currentUser = $routeParams.user;
	$scope.roomname = '';
	$scope.message = '';

	//socket.emit('users');

	//socket.on('userlist', function (userList) {
	//	$scope.currentUsers = userList;
	//});

    $scope.newRoom = function() {
        $scope.rooms.push($scope.roomname);

        socket.emit('joinroom', { room: $scope.roomname }, function(success, reason) {
		    if (!success) {
		        $scope.errorMessage = reason;
		    }
		    else {
		        $location.path('/room/' + $scope.currentUser + '/' + $scope.roomname);
		    }
		});
    };	

    socket.emit('rooms');
	socket.on('roomlist', function (rooms){
		$scope.rooms = Object.keys(rooms);
	});

	$scope.logout = function() {
		socket.emit('disconnect');
		$location.path("/login");
	};
 
});
 
ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';
	$scope.message = '';
	$scope.messages = [];

	$scope.goBack = function() {

		socket.emit('partroom', $scope.currentRoom);

		socket.on('updateusers', function (roomName, users, ops) {
			if(roomName === $scope.currentRoom){
				$scope.currentUsers = users;
			}
		});	
		// sockets.on('servermessage', function (message, room, username) {
		// 	console.log("message: ");
		// 	console.log(message);
		// 	console.log("room: ");
		// 	console.log(room);
		// 	console.log("username: ");
		// 	console.log(username);
		// });
		$location.path('/rooms/' + $scope.currentUser);
	};

	$scope.logout = function() {
		socket.emit('partroom', $scope.currentRoom);
		socket.emit('disconnect');
		$location.path("/login");
	};


	socket.on('updateusers', function (roomName, users, ops) {
		if(roomName === $scope.currentRoom){
			$scope.currentUsers = users;
			$scope.$apply();
		}
	});		
 
	socket.emit('joinroom', {room: $scope.currentRoom}, function (success, reason) {
		if (!success) {
			$scope.errorMessage = reason;
		}
	});


	 $scope.submitMsg = function() {
	 	if($scope.message !== ''){
	 		socket.emit('sendmsg', {roomName: $scope.currentRoom, msg: $scope.message});
			$scope.message = '';
	 	}			
    };

    socket.on('updatechat', function (roomName, messageHistory) {
		//pushes all current messages to the messages array to be displayed
		//Hugsanlegt TODO: Passa að roomName passi
		if ($scope.currentRoom === roomName) {
			$scope.messages = messageHistory;
			$scope.$apply();
		}
    });
});



