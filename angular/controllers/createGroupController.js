angular.module("createGroupController", []).controller("createGroupController", 
	function($scope, $http, $rootScope, companyService, $window, $state) {

		$scope.groupName = '';
		$scope.userList = [];
		$scope.roleList = [];
		$scope.userIds = [];
		$scope.roleIds = [];
		$scope.oldUserIds = [];
		$scope.oldRoleIds = [];
		$scope.users = [];
		$scope.roles = [];
		$scope.usersAndGroupsData = '';

		Array.prototype.map = Array.prototype.map || function(_x) {
			for(var o=[], i=0; i<this.length; i++) { 
				o[i] = _x(this[i]); 
			}
			return o;
		};
		console.log(" page type = : "+$rootScope.createEditType);
		var editGroupData = $window.localStorage.getItem('editGroupData');
		if (editGroupData != null && editGroupData != '' && editGroupData != undefined){
			editGroupData = JSON.parse($window.localStorage.getItem('editGroupData'));
			console.log("editGroupData = : "+editGroupData.groupId);
		// save selected userids to userIds & oldUserIds
		if(editGroupData.userids.indexOf(",")>0){
			$scope.oldUserIds = editGroupData.userids.split(",").map(Number);
			$scope.userIds = editGroupData.userids.split(",").map(Number);
		}
		else{
			$scope.oldUserIds = editGroupData.userids.split().map(Number);
			$scope.userIds = editGroupData.userids.split().map(Number);
		}
		// save selected roleIds to roleIds & oldRoleIds
		if(editGroupData.roleids.indexOf(",")>0){
			$scope.oldRoleIds = editGroupData.roleids.split(",").map(Number);
			$scope.roleIds = editGroupData.roleids.split(",").map(Number);
		}
		else{
			$scope.oldRoleIds = editGroupData.roleids.split().map(Number);
			$scope.roleIds = editGroupData.roleids.split().map(Number);
		}
		console.log("UserIds = : "+$scope.userIds+"    RoleIds = : "+$scope.roleIds);
		console.log("oldUserIds = : "+$scope.oldUserIds+"    oldRoleIds = : "+$scope.oldRoleIds);
		// save selected usernames to users
		if(editGroupData.usernames.indexOf(",")>0){
			$scope.users = editGroupData.usernames.split(",");
		}
		else{
			$scope.users.push(editGroupData.usernames);
		}
		// save selected rolenames to roles
		if(editGroupData.rolenames.indexOf(",")>0){
			$scope.roles = editGroupData.rolenames.split(" , ");
		}
		else{
			$scope.roles.push(editGroupData.rolenames);
		}
		$scope.groupName = editGroupData.groupName;
		$rootScope.createEditType = 'Edit Group';
	}else{
		$scope.userList = [];
		$scope.roleList = [];
		$rootScope.createEditType = 'Create Group';
		$scope.groupName = '';
	}

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
		$window.localStorage.setItem('editGroupData', '');
		$scope.userList = [];
		$scope.roleList = [];
		$rootScope.createEditType = 'Create Group';
		$scope.groupName = '';
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
		console.log(" createEditType = : "+$rootScope.createEditType);
		if($rootScope.createEditType == 'Edit Group'){
			modifyGroup();
		}else if($rootScope.createEditType == 'Create Group'){
			createNewGroup();
		}
	}

	$scope.afterSelectItem = function(item){
		/*perform operation on this item after selecting it.*/
		if(item.indexOf("@")>0){
			console.log("user email = : "+ item.split("(")[1].split(")")[0]);
			for(var x in $scope.usersAndGroupsData.userList){
				if($scope.usersAndGroupsData.userList[x].email == (item.split("(")[1].split(")")[0]))
					$scope.userIds.push($scope.usersAndGroupsData.userList[x].userId);
			}
			console.log(" $scope.userIds = : "+$scope.userIds);
			console.log(" $scope.oldUserIds = : "+$scope.oldUserIds);
		}else{
			console.log("roleName = : "+ item);
			for(var x in $scope.usersAndGroupsData.roleList){
				if($scope.usersAndGroupsData.roleList[x].roleName == item)
					$scope.roleIds.push($scope.usersAndGroupsData.roleList[x].roleId);
			}
			console.log(" $scope.roleIds = : "+$scope.roleIds);
			console.log(" $scope.oldRoleIds = : "+$scope.oldRoleIds);
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
    				break;
    			}
    		}
    	}
    	console.log(" $scope.userIds = : "+$scope.userIds);
    	console.log(" $scope.oldUserIds = : "+$scope.oldUserIds);
    }else{
    	console.log("roleName = : "+ item);
    	console.log(" RoleList = : "+$scope.usersAndGroupsData.roleList);
    	for(var x in $scope.usersAndGroupsData.roleList){
    		console.log(" x = : "+x);
    		if($scope.usersAndGroupsData.roleList[x].roleName == item){
    			var index = $scope.roleIds.indexOf($scope.usersAndGroupsData.roleList[x].roleId);
    			console.log(" role index = : "+index);
    			if (index > -1) {
    				$scope.roleIds.splice(index, 1);
    				break;
    			}
    		}
    	}
    	console.log(" $scope.roleIds = : "+$scope.roleIds);
    	console.log(" $scope.oldRoleIds = : "+$scope.oldRoleIds);
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

function modifyGroup(){
	var accountId = $window.localStorage.getItem('currentAccount');
	console.log(" groupName = : "+$scope.groupName + " groupId= : "+editGroupData.groupId);
	console.log(" userIds "+$scope.userIds + " oldUserIds = : "+$scope.oldUserIds);
	console.log(" roleIds "+$scope.roleIds+ " oldRoleIds = : "+$scope.oldRoleIds);
	$http({
		method : "post",
		url : "/modifyGroup",
		headers : {"Content-Type" : "application/json"},
		data : {
			accountId : accountId,
			groupName : $scope.groupName,
			groupId : editGroupData.groupId,
			users : $scope.userIds,
			oldUsers : $scope.oldUserIds,
			roles : $scope.roleIds,
			oldRoles : $scope.oldRoleIds

		}
	})
	.success(function(data) {
		if(data.success==1){
			console.log("  Group Modified ");
			$rootScope.createEditDeleteGroupStatus = " Group modified successfully !";
			$state.go('iam.manageGroup');
		}
	});
}

});