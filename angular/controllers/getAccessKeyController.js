angular.module("getAccessKeyController", ['ui.bootstrap']).controller("getAccessKeyController", 
function($rootScope, $scope, $http, companyService, $window) {
	var ip = companyService.getId();
    if(ip==undefined){
 		ip = $window.localStorage.getItem('serverIp');
 	}
 	$window.localStorage.setItem('serverIp', ip);
    companyService.setId(null);
    $scope.close = function(value) {
		if(value == "getAccessKeyCancelButton"){
			$scope.visibleGetAccessKeyEachPage = $scope.visibleGetAccessKeyEachPage ? false : true;
		}
		else if(value == "getAccessKeyOkButton"){
	            $scope.visibleGetAccessKeyEachPage = $scope.visibleGetAccessKeyEachPage ? false : true;
				// call method to generate new access key-pair and update agentActivities
				$http({
				url: "/requestServerAccess",
				method: "POST",
				data: {serverIp:ip,name:$rootScope.name},

				headers: {"Content-Type": "application/json"}
				})
				.success(function(data){
				});
		}

}
});