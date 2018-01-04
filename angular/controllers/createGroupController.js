angular.module("createGroupController", []).controller("createGroupController", 
function($scope, $http, $rootScope, companyService, $window, $state) {

	$rootScope.addFunction = function() {
		console.log(" Add new User ");
		$state.go('iam.createGroup');
    }
});