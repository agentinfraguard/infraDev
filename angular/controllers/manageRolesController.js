angular.module("manageRolesController", []).controller("manageRolesController", 
function($scope, $http, $rootScope, companyService, $window) {

//$scope.rolesData = '';

var getRolesData = function() {
    var accountId = $window.localStorage.getItem('currentAccount');
	var userId = $window.localStorage.getItem('loggedInUser');
	$http({
	method : "post",
	url : "/getManageRolesData",
	headers : {"Content-Type" : "application/json"},
	data : {accountId : accountId,userId : userId}
	})
	.success(function(data) {
        console.log(" RolesData policy = : "+JSON.parse(data.roleData[0].policy)[0].access+"   "+data.roleData[0].policy.resource+"   "+data.roleData[0].policy.resourceId+"   "+data.roleData[0].policy.activities);
        var rolesData = data.roleData
        for(var x in rolesData){
        	rolesData[x].policy = JSON.parse(rolesData[x].policy);
        }
        $scope.rolesData = rolesData;
	});
};

	getRolesData();
	
});