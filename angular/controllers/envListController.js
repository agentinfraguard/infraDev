angular.module("envListController", ['ui.bootstrap']).controller("envListController", 
function($scope, $http, $rootScope, companyService, $window) {
	var ip = companyService.getId();
    if(ip==undefined){
 		ip = $window.localStorage.getItem('serverIp');
 	}
 	$window.localStorage.setItem('serverIp', ip);
    companyService.setId(null);
  
   

$rootScope.close = function(value) {

      
		if(value == "envVarUserSpecificEach"){
    	   		userDataEnv="user";
    	   		$rootScope.envdata="";
    	   		$rootScope.userData =userDataEnv;
				console.log("envVarUserSpecific clicked");
			    //$http({
			   //	url: "/envVarUserSpecific",
			  //	method: "POST",
			//	    data: {serverIp:ip_addr,name:$rootScope.name},
			///	    headers: {"Content-Type": "application/json"}
			//    })
			//      .success(function(data){
		            var data={"envList":{"govind":"$GOPATH/bin","GOPATH":"$HOME/go_workspace","GOROOT":"/usr/lib/go-1.6","PATH":"$PATH:$GOROOT/bin:$GOBIN","VAR":"HELLO_WORLD"}}
					$rootScope.envdata=data.envList;
					console.log(data.envList);
			//});
    	   }

    	   
            else if(value == "envVarSystemSpecificEach"){
    	   		userDataEnv="system";
    	   		$rootScope.envdata="";
    	   		$rootScope.userData =userDataEnv;
				//console.log("envVarSystemSpecific clicked");
		    	 $http({
				      url: "/showEnvironmentVariablesData",
				      method: "POST",
				      data: {serverIp:ip},
				      headers: {"Content-Type": "application/json"}
			       })
			     .success(function(data){
				      var data = JSON.parse(data[0].envVars);
				      userDataEnv="system"
                     if (data!=null) {
	                     $rootScope.userData =userDataEnv;  
	           	         $rootScope.envdata=data.envList;
			            }
			       });
    	    }

     else if(value == "refreshEnvVarsButton"){
			
			/*$http({
				url: "/refreshEnvironmentVars",
				method: "POST",
				data: {serverIp:ip,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			})
			 .success(function(data){
			 	  var data = JSON.parse(data[0].envVars);
				
                 if (data!=null) {
	                 $rootScope.user = "SYSTEM";
	             	 $rootScope.envdata=data.envList;
			        }

			   });*/
   	 }
    	 
}


 var enviVarLoadDetail= function() {
		                $scope.totalItems ="";
                        $scope.maxSize = ""; 
                        $rootScope.visibleUserList = $rootScope.visibleUserList ?false : true;
						userDataEnv="system";
    	   		        $rootScope.envdata="";
    	   		
			            $http({
							url: "/showEnvironmentVariablesData",
							method: "POST",
							data:{serverIp:ip},
							headers: {"Content-Type": "application/json"}
				        })
				       .success(function(data){
					       var data = JSON.parse(data[0].envVars);
	                       if (data!=null) {
		                      $rootScope.userData =userDataEnv;
		                      $rootScope.envdata=data.envList;
				            }
				       });
		 
          }


  enviVarLoadDetail()

      $scope.setPage = function (pageNo) {
                  $scope.currentPage = pageNo;
                };

                $scope.pageChanged = function() {
                   console.log('Page changed to: ' + $scope.currentPage);
                };

               $scope.setItemsPerPage = function(num) {
                 $scope.itemsPerPage = num;
                 $scope.currentPage = 1; //reset to first page
                 }
});