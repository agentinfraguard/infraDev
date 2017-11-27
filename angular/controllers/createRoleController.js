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

	$scope.policies = [

	                { 'access':'allow',
	                  'resource': 'company',
	                  'resourceId': 12,
	                  'activities': [1,2,3]
	                },
                	{ 'access':'allow',
                      'resource': 'project',
                      'resourceId': 3,
                      'activities': [1,2,3,4,5,6]
                    }
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
		$scope.policies.push({ 'access':$scope.newAccess, 'resource': $scope.newResource, 'resourceId':$scope.newResourceId, 'activities': $scope.newActivities });
		$scope.newAccess = '';
		$scope.newResource = '';
		$scope.newResourceId = '';
		$scope.newActivities = [];
	};

	$scope.getResourceDetails = function(newResource){
		console.log(" getResourceDetails for = : "+newResource);
		if(newResource == 'All'){
			$scope.activityList = ['All','Read Only'];
			$scope.resourceList = [];
		}
		
		else if (newResource == 'IAM'){
			$scope.resourceList = ['Manage Roles','Manage Groups','Manage Users'];
		}

	}

	$scope.getActivityList = function(newResourceId){
		console.log(" getActivityList for = : "+newResourceId);
	}

});