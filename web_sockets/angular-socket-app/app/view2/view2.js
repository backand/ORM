'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['socket', '$scope', function(socket, $scope) {
	$scope.messages = [];
	socket.on('action', function (data) {
	    this.content = data.content;
	    $scope.messages.push(data);
	});
}]);