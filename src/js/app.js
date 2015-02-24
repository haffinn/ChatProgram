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
	$scope.rooms = ['Lobby'];
	$scope.currentUser = $routeParams.user;
	$scope.roomname = '';
	$scope.message = '';
 
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
 
	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		$scope.currentUsers = users;
	});		
 
	socket.emit('joinroom', {room: $scope.currentRoom}, function (success, reason) {
		if (!success)
		{
			$scope.errorMessage = reason;
		}
	});


	 $scope.submitMsg = function() {
	 	console.log("submitmsg: " + $scope.message);
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



