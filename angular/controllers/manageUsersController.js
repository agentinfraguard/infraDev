angular.module("manageUsersController", []).controller("manageUsersController", 
function($scope, $http, $rootScope, companyService, $window, $state) {

$scope.usersData = [];
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
	console.log(" Add new User ");
	$state.go('iam.inviteUsers');
}

var getUsersData = function() {
    var accountId = $window.localStorage.getItem('currentAccount');
	var userId = $window.localStorage.getItem('loggedInUser');
	$http({
		method : "post",
		url : "/getManageUsersData",
		headers : {"Content-Type" : "application/json"},
		data : {accountId : accountId,userId : userId}
	})
	.success(function(data) {
        console.log(" data = "+JSON.stringify(data)+"   data length = "+data.length);
        for (var x in data){
			putUsersIntoArray(data[x].groupName,data[x].uname,data[x].email,data[x].userId);
        }
        console.log("userdata = : "+JSON.stringify($scope.usersData));
    });
};

getUsersData();

function putUsersIntoArray(groupName,userName,userEmail,userId){
	console.log("putRolesIntoArray");
	var array = eval( $scope.usersData );
	console.log("array = : "+array);
	for (var i = 0; i < array.length; i++ ){
		if(array[i].email === userEmail){
			array[i].groupName = array[i].groupName +" , "+ groupName;
			return;
		}
	}
	array.push({'groupName':groupName,'userName':userName,'email':userEmail,'userId':userId});
}

$scope.deleteUser = function(index) {
    var accountId = $window.localStorage.getItem('currentAccount');
	var userId = $scope.usersData[index].userId;// userId to delete not loggedIn user
	 console.log("accountId = : "+accountId+" userId = : "+userId);
	$http({
		method : "post",
		url : "/deleteUser",
		headers : {"Content-Type" : "application/json"},
		data : {accountId:accountId, userId:userId}
	})
	.success(function(data) {
		if(data.success==1){
			$scope.usersData.splice( index, 1 );
		    $scope.selectedIndex = -1;
		    $rootScope.createEditDeleteUserStatus = " The group has been deleted. "
	    }else{
	    	$rootScope.createEditDeleteUserStatus = " Something went wrong.Please try again !"
	    }
	});
};

});