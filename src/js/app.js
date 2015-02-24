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
	// TODO: Query chat server for active rooms
	$scope.rooms = [];
	$scope.currentUser = $routeParams.user;
	$scope.roomname = '';
	$scope.message = '';

	socket.emit('rooms');
	socket.on('roomlist', function (rooms){
		$scope.rooms = Object.keys(rooms);
	});

    $scope.newRoom = function() {
        $scope.rooms.push($scope.roomname);
        document.getElementById('roomname').value='';
    };
 
});
 
ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';
	$scope.message = '';
	$scope.messages = [];

	socket.emit('users');

	socket.on('userlist', function (userList) {
		console.log("userList: ");
		console.log(userList);
		$scope.currentUsers = userList;
	});

	console.log("currentUsers: ");
	console.log($scope.currentUsers);

	socket.on('updateusers', function (roomName, users, ops) {

		console.log("updateusers running");
		// TODO: Check if the roomName equals the current room !
		console.log("roomName: " + roomName + ", current room: " + $scope.currentRoom);
		if(roomName === $scope.currentRoom){
			console.log("roomname equals currentroom");
			$scope.currentUsers = users;
		}
		
		console.log("currentUsers: ");
		console.log($scope.currentUsers);
		console.log("users: ");
		console.log(users);
	});		
 
	socket.emit('joinroom', {room: $scope.currentRoom}, function (success, reason) {
		console.log("joinroom running");
		if (!success)
		{
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
    			$scope.messages = messageHistory;
    		});
});



