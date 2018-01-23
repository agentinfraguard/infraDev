angular.module("eachServerDetailController", ['ui.bootstrap']).controller("eachServerDetailController", 
function($scope, $http, $rootScope, companyService, $window, $timeout, $document) {

	$scope.visible = false;
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
	 	 	 $scope.serverName=data.serverDetail.serverName;
	 		 $scope.user=data.serverDetail.userList;
	 		 $rootScope.lockdownServerDetail1=data.serverDetail.lockedDown;
	 		 $scope.hostNameDetails=data.serverDetail.hostname;
	 		 $scope.serverIpDetails=data.serverDetail.serverIP;
	 		 $scope.ServerIPpublic=data.serverDetail.publicIP;
	 		 if(data.serverDetail.cpu!== null){   
                 var cpuDetail=data.serverDetail.cpu.split(",");
                 $scope.cpu=cpuDetail[0];
	 		     $scope.cpuDetails=data.serverDetail.cpu;
	 		 }	 		 
	 		 
	 		 $scope.ramDetails=data.serverDetail.ram;
	 		 if(data.serverDetail.ram!==null){
                var ramDetail=data.serverDetail.ram.split(",");
	 		    ramDetailString=String(ramDetail[0])
	 		    ramDetail=ramDetailString.split(":")
	 		    $scope.ram="Total  "+ramDetail[1];

	 		 }
	 		
	 		 var KeyRotationDetails=data.serverDetail.autoKeyRotation;
	 		  if(KeyRotationDetails=0){
                   $scope.KeyRotation="User Managed"
	 		    }
	 		  else{
	 		  	   $scope.KeyRotation="Auto"
	 		    }
	 		  var lockdownServerDetails=data.serverDetail.lockedDown;
	 		     if(lockdownServerDetails=0){
	 		         $scope.LockdownServer="Unlocked"
	 		        }
	 		     else{
                     $scope.LockdownServer="Locked"
	 		        }

            })

    }
 
    serverDetails();
});