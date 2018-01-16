angular.module("inviteUsersController", []).controller("inviteUsersController", 
	function($scope, $http, $rootScope, companyService, $window, $state) {

$scope.groupList = [];
$scope.groupIds = [];
$scope.oldGroupIds = [];
$scope.groupData = [];
$scope.groups = [];

	var editUserData = $window.localStorage.getItem('editUserData');
	console.log("editUserData = : "+editUserData);
	if (editUserData != null && editUserData != '' && editUserData != undefined){
		editUserData = JSON.parse($window.localStorage.getItem('editUserData'));
		console.log(" editUserData = : "+editUserData);
		$rootScope.inviteEditType = 'Edit User';
		$scope.userEmail = editUserData.email;
		// save selected groups to groups
		if(editUserData.groupName.indexOf(",")>0){
			$scope.groups = editUserData.groupName.split(" , ");
		}
		else{
			$scope.groups.push(editUserData.groupName);
		}
	}else{
		$rootScope.inviteEditType = 'Invite User';
		$scope.userEmail = '';
		$scope.groups = [];
	}

var getGroupsList = function() {
	var accountId = $window.localStorage.getItem('currentAccount');
	$http({
		method : "post",
		url : "/getGroupsList",
		headers : {"Content-Type" : "application/json"},
		data : {accountId : accountId}
	})
	.success(function(data) {
		if(data.success==1){
			$scope.groupData = data.groupData;
			for(var x in data.groupData){
				var group = data.groupData[x].groupName;
				$scope.groupList.push(group);
			}
			if($rootScope.inviteEditType == 'Edit User'){
				for(i=0;i<$scope.groups.length;i++){
					for(var x in data.groupData){
						if(data.groupData[x].groupName==$scope.groups[i]){
						$scope.groupIds.push(data.groupData[x].groupId);
						$scope.oldGroupIds.push(data.groupData[x].groupId);
						break;
						}
					}
				}
			}
		}
	});
};

getGroupsList();

$rootScope.addFunction = function() {
	console.log(" Add new User ");
	$window.localStorage.setItem('editUserData', '');
	$rootScope.inviteEditType = 'Invite User';
	$scope.userEmail = '';
	$scope.groups = [];
	$scope.oldGroupIds = [];
	$state.go('iam.inviteUsers');
}

$scope.afterGroupSelect = function(item){
	/*perform operation on this item after selecting it.*/
	console.log("user group Select = : "+ item);
	for(var x in $scope.groupData){
		if($scope.groupData[x].groupName == item)
			$scope.groupIds.push($scope.groupData[x].groupId);
	}
	console.log(" $scope.groupIds = : "+$scope.groupIds+" oldGroupIds = "+$scope.oldGroupIds);
}

$scope.afterGroupRemove = function(item){
// perform operation on this item after removing it.
console.log("user group Remove Item  = :  "+item);
for(var x in $scope.groupData){
	if($scope.groupData[x].groupName == item){
		var index = $scope.groupIds.indexOf($scope.groupData[x].groupId);
		if (index > -1) {
			$scope.groupIds.splice(index, 1);
			break;
		}
	}
}
console.log(" $scope.groupIds = : "+$scope.groupIds+" oldGroupIds = "+$scope.oldGroupIds);
}


$rootScope.inviteEditUser = function() {
	var groupIds = [];
	var type = $rootScope.inviteEditType;
	if($scope.groupIds.length>0){
		groupIds = $scope.groupIds;
	}else{
		groupIds = [2];//default group will be super-read
	}
		var email = $scope.userEmail;
	if(email == '' || email == undefined || email == null || email.length == 0){
		$scope.userEmailValidation = "Please Enter an Email ";
		return;
	}
	console.log("email = : "+email+"   groups = : "+$scope.groups+"    groupIds = : "+groupIds+"   type = : "+$rootScope.inviteEditType);
	if(type == 'Edit User'){
		editUserGroups();
	}else if(type == 'Invite User'){
		inviteNewUser();
	}
}

function editUserGroups(){

	var accountId = $window.localStorage.getItem('currentAccount');
	var userId = JSON.parse($window.localStorage.getItem('editUserData')).userId;
	var accountOwnerId = $window.localStorage.getItem('currentAccountOwner');
	console.log("accountId = "+accountId+"   userId = : "+userId+"  accountOwnerId = : "+accountOwnerId+"   groupIds = : "+$scope.groupIds+"    oldGroupIds = : "+$scope.oldGroupIds);
    
    if(accountOwnerId == userId){
    	if($scope.groupIds.indexOf(1) == -1){
    		$scope.superAdminValidation = "Account owner will always be super-admin. Please select super-admin";
    		return;
    	}else{
    		$scope.superAdminValidation = "";
    	}
    }
	console.log(" going to call controller ");
    $http({
		method : "post",
		url : "/editUserGroupsInAccount",
		headers : {"Content-Type" : "application/json"},
		data : {accountId : accountId,userId : userId,groupIds : $scope.groupIds,oldGroupIds : $scope.oldGroupIds}
	})
	.success(function(data) {
		if(data.success == 1){
			$rootScope.inviteUserStatus = "User groups successfully updated !";
			$state.go('iam.manageUsers');
		}
	});
}

function inviteNewUser(){
	var accountId = $window.localStorage.getItem('currentAccount');
	var groupIds = [];
	if($scope.groupIds.length>0){
		groupIds = $scope.groupIds;
	}else{
		 groupIds = [2];//default group will be super-read
	}
		var email = $scope.userEmail;
		$http({
			method : "post",
			url : "/inviteUserToAccount",
			headers : {"Content-Type" : "application/json"},
			data : {email : email,groupIds : groupIds,accountId : accountId}
		})
		.success(function(data) {
			if(data.success==1){
			// user already added to account
			console.log(" user already added to account ");
			$rootScope.inviteUserStatus = "This user is already added to account";
			$state.go('iam.manageUsers');
		}
		if(data.success==2){
			// user added to account
			console.log(" user added to account ");
			$rootScope.inviteUserStatus = "New user added to account";
			$state.go('iam.manageUsers');
		}
		if(data.success==3){
			// user created & added to account
			console.log(" user created & added to account & groups >> passw = "+data.passw);
			//and mail user credentials
			var userCredentials = {passw :data.passw,email:email,url:$window.location.host};
			$http({
				url : "/mailUserCredentialsUrl",
				data : userCredentials,
				method : "post",
				headers: {'Content-Type': 'application/json'},
			}).success(function(data){
			    	//user created, added , and credentials mailed
			    	$rootScope.inviteUserStatus = "New user created and added to account";
			    	$state.go('iam.manageUsers');
			    });

		}
		if(data.success=="error"){
			// some error occurred
			console.log(" Please Try Again ! ");
			$rootScope.inviteUserStatus = "Error, Please Try Again !";
			$state.go('iam.manageUsers');
		}
	});
	}

	$scope.gotoManageUsers = function(){
		console.log(" gotoManageUsers ");
		$state.go('iam.manageUsers');
	}
});