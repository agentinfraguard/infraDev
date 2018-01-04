angular.module("manageRolesController", []).controller("manageRolesController", 
function($scope, $http, $rootScope, companyService, $window, $state) {

//$rootScope.createEditDeleteRoleStatus = '';
$scope.rolesData = '';
$rootScope.editCreateRole = 'Create Role';
$scope.selectedIndex = -1;
$scope.visible = false;

$scope.showRoleOptions = function(index) {
	if($scope.selectedIndex != index){
		$scope.visible = false;
	}
	$scope.selectedIndex = index;
	$scope.visible = $scope.visible ? false : true;
};

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
        var data = data.roleData
        for(var x in data){
        	console.log(" data["+x+"].policy = "+data[x].policy+"    typeof = "+typeof(data[x].policy));
        	if(typeof(data[x].policy) == 'string'){
        		data[x].policy = JSON.parse(data[x].policy);
           }
        }
        $scope.rolesData = data;
	});
};

getRolesData();

$scope.deleteRole = function(index) {
    var accountId = $window.localStorage.getItem('currentAccount');
	var userId = $window.localStorage.getItem('loggedInUser');
	var roleId = $scope.rolesData[index].roleId;
	console.log(JSON.stringify($scope.rolesData));
	console.log(" delete index = : "+index+ " Delete Row Id = : "+$scope.rolesData[index].roleId);
	$http({
		method : "post",
		url : "/deleteRole",
		headers : {"Content-Type" : "application/json"},
		data : {accountId:accountId, userId:userId, roleId:roleId}
	})
	.success(function(data) {
		if(data.success==1){
			$scope.rolesData.splice( index, 1 );
		    $scope.selectedIndex = -1;
		    $rootScope.createEditDeleteRoleStatus = " The Role has been deleted. "
	    }else{
	    	$rootScope.createEditDeleteRoleStatus = " Something went wrong.Please try again !"
	    }
	});
};

$rootScope.addFunction = function() {
	console.log(" Add new Role ");
	$window.localStorage.setItem('editRoleData', '');
	$rootScope.editCreateRole = 'Create Role';
	$state.go('iam.createEditRole');
}

$scope.editRole = function(index){
	console.log(" Edit Role index = "+index+"   RoleData = "+JSON.stringify($scope.rolesData[index]));
	$window.localStorage.setItem('editRoleData', JSON.stringify($scope.rolesData[index]));
	$rootScope.editCreateRole = 'Edit Role'
	$state.go('iam.createEditRole');
}
	
});