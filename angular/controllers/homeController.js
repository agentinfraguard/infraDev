angular.module("homeController", []).controller("homeController", function($scope, $rootScope, $window){
	$rootScope.title = "";
	
	$window.localStorage.clear();
	
});