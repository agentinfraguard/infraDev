angular.module("manageRolesController", []).controller("manageRolesController", 
function($scope, $http, $rootScope, companyService, $window, $state, $document) {

//$rootScope.createEditDeleteRoleStatus = '';
$scope.success ='success';
$scope.rolesData = '';
$rootScope.editCreateRole = 'Create Role';
$scope.selectedIndex = -1;
$rootScope.visible = false;
$rootScope.visibleDeleteUserData=false;
$rootScope.deleteButtonValue="";
var indexValue="";
var body = angular.element($document[0].body);

$scope.showRoleOptions = function(index,$event) {
	if($scope.selectedIndex != index){
		$rootScope.visible = false;
	}
	$scope.selectedIndex = index;
	$rootScope.visible = $scope.visible ? false : true;
	  $event.stopPropagation();
};
$scope.removeAlert=function(){    
    $scope.success =null;
  }
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

$rootScope.openPopUp = function(value,index) {
	if(value=="DeleteRole"){
    $rootScope.deleteRoleName=" Delete Role ";
	$rootScope.deleteValue="Role";
	$rootScope.deleteButtonValue="deleteRole"
	$rootScope.visibleDeleteUserData = $rootScope.visibleDeleteUserData ? false : true;
    $('.afterloginBody').addClass("overflowHidden");
	$rootScope.modal_class = "modal-backdrop fade in";
	indexValue=index;

	}
	else if (value=="Delete"){
     $rootScope.visibleDeleteUserData = $rootScope.visibleDeleteUserData ? false : true;
     $('.afterloginBody').removeClass("overflowHidden");
     $rootScope.modal_class = "";
       deleteRoles(indexValue)

	}

 };
$rootScope.close = function() {
   $rootScope.visibleDeleteUserData = $rootScope.visibleDeleteUserData ? false : true;
  $('.afterloginBody').removeClass("overflowHidden");
  $rootScope.modal_class = "";
  
}


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

function deleteRoles(indexValue){
	console.log(indexValue)
     var accountId = $window.localStorage.getItem('currentAccount');
	 var userId = $window.localStorage.getItem('loggedInUser');
	 var roleId = $scope.rolesData[indexValue].roleId;
	 console.log(JSON.stringify($scope.rolesData));
	 console.log(" delete index = : "+indexValue+ " Delete Row Id = : "+$scope.rolesData[indexValue].roleId);
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

}

	
});