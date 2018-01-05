angular.module("createRoleController", []).controller("createRoleController", 
function($scope, $http, $rootScope, companyService, $window, $state) {

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

	var editRoleData = $window.localStorage.getItem('editRoleData');
	if (editRoleData != null && editRoleData != '' && editRoleData != undefined){
		editRoleData = JSON.parse($window.localStorage.getItem('editRoleData'));
		console.log(" editRoleData = : "+editRoleData);
		$scope.policies = editRoleData.policy;
		$scope.roleName = editRoleData.roleName;
		$rootScope.editCreateRole = 'Edit Role';
	}else{
		$scope.policies = [];
		$rootScope.editCreateRole = 'Create Role';
		$scope.roleName = '';
	}

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
		checkPolicyDuplicacy($scope.newAccess,$scope.newResource,$scope.newResourceId,$scope.newActivities);
		$scope.newAccess = '';
		$scope.newResource = '';
		$scope.newResourceId = '';
		$scope.newActivities = [];
		$scope.policyValidation = '';
	};

	function checkPolicyDuplicacy(access,resource,resourceId,activities){
		var policyArray = eval( $scope.policies );
    	for( var i = 0; i < policyArray.length; i++ ) {
			if( policyArray[i].resource === resource && policyArray[i].resourceId === resourceId && policyArray[i].access === access) {
				policyArray[i].activities = policyArray[i].activities.concat(activities).unique();
				return;
			}
		}
		$scope.policies.push({ 'access':$scope.newAccess, 'resource': $scope.newResource, 'resourceId':$scope.newResourceId, 'activities': $scope.newActivities });
	}

	Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
    };


	$scope.getResourceDetails = function(newResource){

		console.log(" getResourceDetails for = : "+newResource);
		$scope.newActivities = [];
		$scope.activityList = [];
		$scope.resourceList = [];
		if(newResource == 'All'){
			$scope.activityList = ['All','Read Only'];
			$scope.resourceList = ['All'];
		}
		else if (newResource == 'Company'){
			$scope.activityList = [];
			$scope.resourceList = ['Samsung','Genpact','Globe','JFC','Singapore Telecom'];
			$scope.activityList = ['Create Company','Add User','Create Policy'];
		}
		else if (newResource == 'Project'){
			$scope.activityList = [];
			$scope.resourceList = ['SSH Samsung','MySamsung','GalaxyLife','FileCloud','Bastion Servers'];
			$scope.activityList = ['Create Project','Add User','Create Policy','Start/Stop Auto Key Rotation','Change Server Key'];
		}
		else if (newResource == 'Server'){
			$scope.activityList = [];
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

	$scope.createEditRole = function(){

		console.log(" createEditRole ");
		if($scope.roleName == ''){
			$scope.roleNameValidation = "Please type a Role Name.";
			return;
		}
		if($scope.policies.length==0){
			$scope.policyValidation = "Please add a policy.";
			return;
		}
		if($rootScope.editCreateRole == 'Edit Role'){
       		modifyRole();
        }else{
        	createNewRole();
        }
    }

    function createNewRole(){
    	var accountId = $window.localStorage.getItem('currentAccount'); 
		var userId = $window.localStorage.getItem('loggedInUser');
		console.log("createNewRole : $scope.policies = : "+$scope.policies);
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
                $rootScope.createEditDeleteRoleStatus = " New role created successfully !";
                $state.go('iam.manageroles');
            }
		    else{
	    		$rootScope.createEditDeleteRoleStatus = " Something went wrong.Please try again !"
	        }
		});
    }

    function modifyRole(){
    	var accountId = $window.localStorage.getItem('currentAccount');
		var userId = $window.localStorage.getItem('loggedInUser');
		console.log(" modifyRole : $scope.policies = : "+$scope.policies);
		console.log(" Role Name = : "+$scope.roleName+"     Policies = : "+angular.toJson($scope.policies) +"    accountId = : "+accountId+"    userId = : "+userId+"  roleId = : "+editRoleData.roleId);
        var roleData = {
        	            roleName : $scope.roleName,
        	            policies : angular.toJson($scope.policies),
        	            roleId : editRoleData.roleId,
        	            accountId : accountId,
        	            userId : userId
                       };
        $http({
			url: "/modifyRole",
			method: "POST",
			data: roleData,
			headers: {"Content-Type": "application/json"}
		})
		.success(function(data){
			if(data.success==1){
                $rootScope.createEditDeleteRoleStatus = " Role modified successfully !";
                $state.go('iam.manageroles');
            }
		    else{
	    		$rootScope.createEditDeleteRoleStatus = " Something went wrong.Please try again !"
	        }
		});
    }

	$scope.gotoManageRoles = function(){
		console.log(" gotoManageRoles ");
		$state.go('iam.manageroles');
	}

	$rootScope.addFunction = function() {
		console.log(" Add new Role ");
		$scope.policies = [];
		$rootScope.editCreateRole = 'Create Role';
		$scope.roleName = '';
		$window.localStorage.setItem('editRoleData', '');
	    $state.go('iam.createEditRole');
    }

});