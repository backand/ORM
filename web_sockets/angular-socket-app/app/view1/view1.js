'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['socket', '$scope', function(socket, $scope) {
	$scope.messages = [];
	socket.on('action', function (data) {
	    this.content = data.content;
	    $scope.messages.push(data);
	});
}]);