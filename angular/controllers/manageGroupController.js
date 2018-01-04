angular.module("manageGroupController", []).controller("manageGroupController", 
function($scope, $http, $rootScope, companyService, $window, $state) {


$scope.selectedIndex = -1;
$scope.visibleGroupOptions = false;

$scope.showGroupOptions = function(index) {
	if($scope.selectedIndex != index){
		$scope.visibleGroupOptions = false;
	}
	$scope.selectedIndex = index;
	console.log("index = : "+index+"  $scope.selectedIndex = : "+$scope.selectedIndex);
	console.log(" $scope.visibleGroupOptions before = : "+$scope.visibleGroupOptions);
	$scope.visibleGroupOptions = $scope.visibleGroupOptions ? false : true;
	console.log(" $scope.visibleGroupOptions after = : "+$scope.visibleGroupOptions);
};

$rootScope.addFunction = function() {
	console.log(" Add new User ");
	$state.go('iam.createGroup');
}

});