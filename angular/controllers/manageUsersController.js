angular.module("manageUsersController", []).controller("manageUsersController", 
function($scope, $http, $rootScope, companyService, $window, $state, $document) {
$scope.success ='success';
$rootScope.inviteEditType = 'Invite User';
$scope.usersData = [];
$rootScope.visible = false;
var local_index = -1;
var indexValue="";
var body = angular.element($document[0].body);
$rootScope.visibleDeleteUserData =false;

$scope.accountOwnerId = $window.localStorage.getItem('currentAccountOwner');


$scope.showOptions = function(index,$event) {
	if(local_index != index){
		$rootScope.visible = false;
	}
	local_index = index;
	$rootScope.visible = $rootScope.visible ? false : true;
	 $event.stopPropagation();
};


  $scope.removeAlert=function(){    
    $scope.success =null;
  }



$rootScope.addFunction = function() {
	console.log(" Add new User ");
	$window.localStorage.setItem('editUserData', '');
	$rootScope.inviteEditType = 'Invite User';
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


$rootScope.openPopUp = function(value,index) {
	if(value=="DeleteUser"){
    $rootScope.deleteRoleName=" Delete User ";
	$rootScope.deleteValue="User";
	$rootScope.visibleDeleteUserData = $rootScope.visibleDeleteUserData ? false : true;
    $('.afterloginBody').addClass("overflowHidden");
     $rootScope.modal_class = "modal-backdrop fade in";
	indexValue=index;

	}
	else if (value=="Delete"){
     $rootScope.visibleDeleteUserData = $rootScope.visibleDeleteUserData ? false : true;
    $('.afterloginBody').removeClass("overflowHidden");
	$rootScope.modal_class = "";
     deleteUser(indexValue);
       //console.log("Delete")

	}

 };
$rootScope.close = function() {
   $rootScope.visibleDeleteUserData = $rootScope.visibleDeleteUserData ? false : true;
   $('.afterloginBody').removeClass("overflowHidden");
   $rootScope.modal_class = "";
  
}



$scope.editUser = function(index) {
    $rootScope.inviteEditType = 'Edit User';
    console.log("$scope.usersData = : "+JSON.stringify($scope.usersData[index]));
    $window.localStorage.setItem('editUserData', JSON.stringify($scope.usersData[index]));
	$state.go('iam.inviteUsers');	
};

function deleteUser(indexValue){
  var accountId = $window.localStorage.getItem('currentAccount');

 	var userId = $scope.usersData[indexValue].userId;// userId to delete not loggedIn user
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
}
});