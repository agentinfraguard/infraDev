angular.module("inviteUsersController", []).controller("inviteUsersController", 
function($scope, $http, $rootScope, companyService, $window, $state) {

	$rootScope.addFunction = function() {
		console.log(" Add new User ");
		$state.go('iam.inviteUsers');
    }
});