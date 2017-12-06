angular.module("createRoleController", []).controller("createRoleController", 
function($scope, $http, $rootScope, companyService, $window) {

$scope.roleName = '';
$scope.newAccess = '';
$scope.newResource = '';
$scope.newResourceId = '';
$scope.newActivities = [];
$scope.resources = ['All','Company','Project','Server','IAM'];
$scope.resourceList = [];
$scope.activityList = [];
$scope.policyValidation = '';
$scope.roleName = '';

	$scope.policies = [

	                /*{ 'access':'allow',
	                  'resource': 'company',
	                  'resourceId': 12,
	                  'activities': [1,2,3]
	                },
                	{ 'access':'allow',
                      'resource': 'project',
                      'resourceId': 3,
                      'activities': [1,2,3,4,5,6]
                    }*/
                ];


 	$scope.removeRow = function(resource,resourceId){
 	console.log(" removeRow clicked ");
		var index = -1;
		var policyArray = eval( $scope.policies );
		console.log(" policyArray = :  "+policyArray);
		for( var i = 0; i < policyArray.length; i++ ) {
			if( policyArray[i].resource === resource && policyArray[i].resourceId === resourceId) {
				index = i;
				break;
			}
		}
		if( index === -1 ) {
			alert( "Something gone wrong" );
		}
		$scope.policies.splice( index, 1 );
	};

	$scope.addRow = function(){

		console.log(" addRow clicked ");
		if($scope.newAccess != 'allow' && $scope.newAccess != 'deny'){
			$scope.policyValidation = "Please select Access level.";
			return;
		}
		if($scope.newResource == ''){
			$scope.policyValidation = "Please select a Resource.";
			return;
		}
		if($scope.newResourceId == ''){
			$scope.policyValidation = "Please select a Resource Name.";
			return;
		}
		if($scope.newActivities == ''){
			$scope.policyValidation = "Please select a Activity.";
			return;
		}
		$scope.policies.push({ 'access':$scope.newAccess, 'resource': $scope.newResource, 'resourceId':$scope.newResourceId, 'activities': $scope.newActivities });
		$scope.newAccess = '';
		$scope.newResource = '';
		$scope.newResourceId = '';
		$scope.newActivities = [];
		$scope.policyValidation = '';
	};

	$scope.getResourceDetails = function(newResource){

		console.log(" getResourceDetails for = : "+newResource);
		if(newResource == 'All'){
			$scope.activityList = ['All','Read Only'];
			$scope.resourceList = ['All'];
		}
		else if (newResource == 'Company'){
			$scope.resourceList = ['Samsung','Genpact','Globe','JFC','Singapore Telecom'];
			$scope.activityList = ['Create Company','Add User','Create Policy'];
		}
		else if (newResource == 'Project'){
			$scope.resourceList = ['SSH Samsung','MySamsung','GalaxyLife','FileCloud','Bastion Servers'];
			$scope.activityList = ['Create Project','Add User','Create Policy','Start/Stop Auto Key Rotation','Change Server Key'];
		}
		else if (newResource == 'Server'){
			$scope.resourceList = ['JFC-DASHBOARD-DEV-1A','JFC-DASHBOARD-DEV-1A','SWS-RAILO-JOB-DEV-1A','SWS-RAILO-WEB-UAT-1A','SWS-RAILO-WEB-PROD'];
			$scope.activityList = ['Get Access Key','Add User','Delete User','Change Privilege','Lock/Unlock Server','Get/Set Enviroment Variables','Process List','Audit Login','Run Script'];
		}
		else if (newResource == 'IAM'){
			$scope.resourceList = ['Manage Roles','Manage Groups','Manage Users'];
			$scope.activityList = [];
		}

	}

	$scope.getActivityList = function(newResourceId){
		console.log(" getActivityList for = : "+newResourceId);
		if(newResourceId == 'Manage Roles'){
			$scope.activityList = ['Create Role','Modify Role','Delete Role'];
		}
		else if (newResourceId == 'Manage Groups'){
			$scope.activityList = ['Create Group','Modify Group','Show users in Group','Show roles in Group','Delete Group'];
		}
		else if (newResourceId == 'Manage Users'){
			$scope.activityList = ['Edit User Permission','Delete User ','Invite new user'];
		}
	}

	$scope.createNewRole = function(){

		console.log(" createNewRole ");
		if($scope.roleName == ''){
			$scope.roleNameValidation = "Please type a Role Name.";
			return;
		}
		if($scope.policies.length==0){
			$scope.policyValidation = "Please add a policy.";
			return;
		}
		var accountId = $window.localStorage.getItem('currentAccount');
		var userId = $window.localStorage.getItem('loggedInUser');
		console.log(" Role Name = : "+$scope.roleName+"     Policies = : "+angular.toJson($scope.policies) +"    accountId = : "+accountId+"    userId = : "+userId);
        var roleData = {
        	            roleName : $scope.roleName,
        	            policies : angular.toJson($scope.policies),
        	            accountId : accountId,
        	            userId : userId
                       };
        $http({
			url: "/createNewRole",
			method: "POST",
			data: roleData,
			headers: {"Content-Type": "application/json"}
		})
		.success(function(data){
			if(data.success==1){
				$window.location.href = "/#/manageRole";
		    }
		});

    }

	$scope.gotoManageRoles = function(){
		console.log(" gotoManageRoles ");
		$window.location.href = "/#/manageRole";
	}

});