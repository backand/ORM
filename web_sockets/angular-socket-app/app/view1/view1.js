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
	socket.on('action1', function (data) {
	    this.content = data;
	    $scope.messages.push(data);
	});
}]);