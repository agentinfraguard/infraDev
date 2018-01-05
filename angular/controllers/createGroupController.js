angular.module("createGroupController", []).controller("createGroupController", 
function($scope, $http, $rootScope, companyService, $window, $state) {

$rootScope.editCreateGroup = 'Create Group';
$scope.groupName = '';
$scope.userList = [];
$scope.roleList = [];
$scope.userIds = [];
$scope.roleIds = [];
$scope.usersAndGroupsData = '';

var getUsersAndGroupsData = function() {
    var accountId = $window.localStorage.getItem('currentAccount');
	var userId = $window.localStorage.getItem('loggedInUser');
	$http({
		method : "post",
		url : "/getUsersandGroupsInAnAccount",
		headers : {"Content-Type" : "application/json"},
		data : {accountId : accountId,userId : userId}
	})
	.success(function(data) {
		console.log(" Data = : "+data);
		$scope.usersAndGroupsData = data;
        for(var x in data.userList){
         	var user = data.userList[x].uname+"("+data.userList[x].email+")";
         	if(data.userList[x].uname != undefined)
         	$scope.userList.push(user);
        }
        for(var x in data.roleList){
         	var role = data.roleList[x].roleName;
         	$scope.roleList.push(role);
        }
    });
};

getUsersAndGroupsData();

$rootScope.addFunction = function() {
	console.log(" Add new User ");
	$state.go('iam.createGroup');
}

$scope.gotoManageGroups = function(){
	console.log(" gotoManageGroups ");
	$state.go('iam.manageGroup');
}

$scope.createEditGroup = function(){

		if($scope.groupName == ''){
			$scope.groupNameValidation = "Please type a Group Name.";
			return;
		}
		if($scope.roles.length==0){
			$scope.rolesValidation = "Please add a role.";
			return;
		}
		var accountId = $window.localStorage.getItem('currentAccount');
		console.log(" groupName = : "+$scope.groupName+" users = : "+$scope.users+" roles = : "+$scope.roles+"  accountId = : "+accountId);
		createNewGroup();
		/*if($rootScope.createEditGroup == 'Edit Group'){
       		modifyGroup();
        }else{
        	createNewGroup();
        }*/
}

$scope.afterSelectItem = function(item){
    // perform operation on this item after selecting it.
    if(item.indexOf("@")>0){
    console.log("user email = : "+ item.split("(")[1].split(")")[0]);
		for(var x in $scope.usersAndGroupsData.userList){
         	if($scope.usersAndGroupsData.userList[x].email == (item.split("(")[1].split(")")[0]))
         	$scope.userIds.push($scope.usersAndGroupsData.userList[x].userId);
        }
        console.log(" $scope.userIds = : "+$scope.userIds);
    }else{
    	console.log("roleName = : "+ item);
		for(var x in $scope.usersAndGroupsData.roleList){
         	if($scope.usersAndGroupsData.roleList[x].roleName == item)
         	$scope.roleIds.push($scope.usersAndGroupsData.roleList[x].roleId);
        }
        console.log(" $scope.roleIds = : "+$scope.roleIds);
    }
}

$scope.afterRemoveItem = function(item){
    // perform operation on this item after removing it.
    console.log(" afterRemoveItem item = :  "+item);
    if(item.indexOf("@")>0){
    console.log("user email = : "+ item.split("(")[1].split(")")[0]);
		for(var x in $scope.usersAndGroupsData.userList){
         	if($scope.usersAndGroupsData.userList[x].email == (item.split("(")[1].split(")")[0])){
         		var index = $scope.userIds.indexOf($scope.usersAndGroupsData.userList[x].userId);
         		if (index > -1) {
    				$scope.userIds.splice(index, 1);
    			}
         	}
        }
        console.log(" $scope.userIds = : "+$scope.userIds);
    }else{
    	console.log("roleName = : "+ item);
		for(var x in $scope.usersAndGroupsData.roleList){
         	if($scope.usersAndGroupsData.roleList[x].roleName == item){
         		var index = $scope.roleIds.indexOf($scope.usersAndGroupsData.roleList[x].roleId);
         		if (index > -1) {
    				$scope.roleIds.splice(index, 1);
    			}
         	}
        }
        console.log(" $scope.roleIds = : "+$scope.roleIds);
    }
}

function createNewGroup(){
	var accountId = $window.localStorage.getItem('currentAccount');
	console.log(" groupName = : "+$scope.groupName);
	console.log(" userIds "+$scope.userIds);
	console.log(" roleIds "+$scope.roleIds);

	$http({
		method : "post",
		url : "/createNewGroup",
		headers : {"Content-Type" : "application/json"},
		data : {accountId : accountId,groupName : $scope.groupName,users : $scope.userIds,roles : $scope.roleIds}
	})
	.success(function(data) {
		if(data.success==1){
			console.log(" New Group Created ");
			$rootScope.createEditDeleteGroupStatus = " New group created successfully !";
			 $state.go('iam.manageGroup');
		}
    });
}

});