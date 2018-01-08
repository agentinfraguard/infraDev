angular.module("lockDownServerController", ['ui.bootstrap']).controller("lockDownServerController", 
function($scope, $http, $rootScope, companyService, $window, $timeout, $document) {

	var body = angular.element($document[0].body);
    var ip = companyService.getId();
    if(ip==undefined){
 		ip = $window.localStorage.getItem('serverIp');
 	}
 	$window.localStorage.setItem('serverIp', ip);
    companyService.setId(null);


      
  var serverDetails = function() {
        $http({
	 	  method : "post",
	 	  url : "/eachServerPageDetails",
	 	  headers : {"Content-Type" : "application/json"},
	 	  data : {serverIp:ip}
	 	})
	 	 .success(function(data) {
	 	 	  var lockdownServerDetails=data.serverDetail.lockedDown;
	 		         $scope.LockdownServer=lockdownServerDetails;
	 		      
	 		      
         });

    }
 
    serverDetails();


$rootScope.close = function(value) {

  //          if(value == "serverLockdownCancelButton"){

		// 	$rootScope.visibleLockdownEachServer = $rootScope.visibleLockdownEachServer ? false : true;
			
		// }
	
		 if(value == "serverLockdownOkButton"){
           // $rootScope.visibleLockdownEachServer = $rootScope.visibleLockdownEachServer ? false : true;
			//body.removeClass("overflowHidden");
			//$rootScope.modal_class = "";
			var data = {serverIp: ip};
			$http({
			url: "/lockDownServer",
			method: "POST",
			data: data,
			headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
								
			});
		}
		// else if(value == "serverUnlockCancelButton"){

		// 	$rootScope.visibleUnlockEachServer = $rootScope.visibleUnlockEachServer ? false : true;

		// }
		else if(value == "serverUnlockOkButton"){
            $rootScope.visibleUnlockEachServer = $rootScope.visibleUnlockEachServer ? false : true;
			var data = {serverIp: ip};
			$http({
			url: "/unlockServer",
			method: "POST",
			data: data,
			headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
								
			});
		}
		

}
});