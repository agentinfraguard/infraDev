angular.module("manageGroupController", []).controller("manageGroupController", 
function($scope, $http, $rootScope, companyService, $window, $state) {

$scope.groupsData = [];
$scope.visible = false;
var local_index = -1;

$scope.showOptions = function(index) {
	if(local_index != index){
		$scope.visible = false;
	}
	local_index = index;
	$scope.visible = $scope.visible ? false : true;
};

$rootScope.addFunction = function() {
	console.log(" Add new User to group ");
	$state.go('iam.createGroup');
}

var getGroupsData = function() {
    var accountId = $window.localStorage.getItem('currentAccount');
	var userId = $window.localStorage.getItem('loggedInUser');
	$http({
		method : "post",
		url : "/getManageGroupsData",
		headers : {"Content-Type" : "application/json"},
		data : {accountId : accountId,userId : userId}
	})
	.success(function(data) {

        console.log(" data = "+JSON.stringify(data)+"   data length = "+data.length);
        var grouphasroles = data.grouphasroles;
        var grouphasusers = data.grouphasusers;
        for (var x in grouphasroles){
			putRolesIntoArray(grouphasroles[x].groupName,grouphasroles[x].roleName,grouphasroles[x].groupId);
        }
        console.log(" groupsData = : "+JSON.stringify($scope.groupsData ));
        for (var x in grouphasusers){
			putUsersIntoArray(grouphasusers[x].groupName,grouphasusers[x].uname,grouphasusers[x].email);
        }
        console.log(" groupsData = : "+JSON.stringify($scope.groupsData ));
    });
};

getGroupsData();

function putRolesIntoArray(groupName,roleName,groupId){
	console.log("putRolesIntoArray");
	var array = eval( $scope.groupsData );
	console.log("array = : "+array);
	for (var i = 0; i < array.length; i++ ){
		if(array[i].groupName === groupName){
			array[i].roleName = array[i].roleName +" , "+ roleName;
			return;
		}
	}
	array.push({'groupName':groupName,'roleName':roleName,'groupId':groupId});
}

function putUsersIntoArray(groupName,userName,userEmail){
	console.log("putUsersIntoArray");
	var array = eval( $scope.groupsData );
	for (var i = 0; i < array.length; i++ ){
		console.log(" count = "+array[i].count+" userdata = "+array[i].userdata);
		if(array[i].groupName === groupName){
			if(array[i].count == undefined){
				array[i].count = 1;
				array[i].userdata = userName+":"+userEmail;
			}else{
				array[i].count = array[i].count + 1;
				array[i].userdata = array[i].userdata+","+userName+":"+userEmail;
			}
		}/*else{
			array[i].count = 0;
			array[i].userdata = null;
		}*/
    }
}

$scope.deleteGroup = function(index) {
    var accountId = $window.localStorage.getItem('currentAccount');
	var userId = $window.localStorage.getItem('loggedInUser');
	var groupId = $scope.groupsData[index].groupId;
	 console.log("accountId = : "+accountId+" userId = : "+userId+"  groupId = : "+groupId);
	$http({
		method : "post",
		url : "/deleteGroup",
		headers : {"Content-Type" : "application/json"},
		data : {accountId:accountId, userId:userId, groupId:groupId}
	})
	.success(function(data) {
		if(data.success==1){
			$scope.groupsData.splice( index, 1 );
		    $scope.selectedIndex = -1;
		    $rootScope.createEditDeleteGroupStatus = " The group has been deleted. "
	    }else{
	    	$rootScope.createEditDeleteGroupStatus = " Something went wrong.Please try again !"
	    }
	});
};

});