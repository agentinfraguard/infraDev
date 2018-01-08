angular.module("runScriptController", ['ui.bootstrap']).controller("runScriptController", 
function($scope, $http, $rootScope, companyService, $window) {
	var ip = companyService.getId();
    if(ip==undefined){
 		ip = $window.localStorage.getItem('serverIp');
 	}
 	$window.localStorage.setItem('serverIp', ip);
    companyService.setId(null);
$rootScope.close = function() {
			 $http({
				url: "/runSriptOnServer",
				method: "POST",
				data: {serverIp:ip,script:$scope.runScriptEachServer,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			 })
			 .success(function(data){
			 });
}
});