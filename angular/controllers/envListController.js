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
    	   		$scope.totalItems ="";
                $scope.maxSize = ""; 	
			    $http({
			   	url: "/envVarUserSpecific",
			  	method: "POST",
				    data: {serverIp:ip,name:$rootScope.name},
				    headers: {"Content-Type": "application/json"}
			    })
			      .success(function(data){
			            if (data!=null) {
		                       var data = JSON.parse(data[0].envVars);
						       var envListDataLength = Object.keys(data.envList).length; 
						       var dataObj=[];
						       userDataEnv="system"
						       var dataEnv=data.envList;
				               $.each(dataEnv, function(k, v) {
					              var dataObjEnvList=[]; 
	                              dataObjEnvList.push(k);
	                              dataObjEnvList.push(v);
	                              dataObj.push(dataObjEnvList)
                               });                  
		                      	  $scope.envdata=dataObj;
		                      	  $scope.viewby = 5;
			                      $scope.totalItems =envListDataLength;
			                      $scope.currentPage = 1;
			                      $scope.itemsPerPage = $scope.viewby;
			                      $scope.maxSize = envListDataLength/5;
			                }

			       });
    	   }

    	   
            else if(value == "envVarSystemSpecificEach"){
            	$scope.totalItems ="";
                $scope.maxSize = ""; 
    	   		userDataEnv="system";
    	   		$rootScope.envdata="";
    	   		$rootScope.userData =userDataEnv;
		    	 $http({
				      url: "/showEnvironmentVariablesData",
				      method: "POST",
				      data: {serverIp:ip},
				      headers: {"Content-Type": "application/json"}
			       })
			     .success(function(data){
			        if (data!=null) {
                      var data = JSON.parse(data[0].envVars);
				      var envListDataLength = Object.keys(data.envList).length; 
				       var dataObj=[];
				       userDataEnv="system"
				       var dataEnv=data.envList;
				       $.each(dataEnv, function(k, v) {
				              var dataObjEnvList=[]; 
                              dataObjEnvList.push(k);
                              dataObjEnvList.push(v);
                              dataObj.push(dataObjEnvList)
                          });
	                      	  $scope.envdata=dataObj;
	                      	  $scope.viewby = 5;
		                      $scope.totalItems =envListDataLength;
		                      $scope.currentPage = 1;
		                      $scope.itemsPerPage = $scope.viewby;
		                      $scope.maxSize = envListDataLength/5;
			                }
        
			  });
    	    }

     else if(value == "refreshEnvVarsButton"){
			
			$http({
				url: "/refreshEnvironmentVars",
				method: "POST",
				data: {serverIp:ip,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			})
			   .success(function(data){
			      if (data!=null) {
                      var data = JSON.parse(data[0].envVars);
				      var envListDataLength = Object.keys(data.envList).length; 
				       var dataObj=[];
				       userDataEnv="system"
				       var dataEnv=data.envList;
				       $.each(dataEnv, function(k, v) {
				              var dataObjEnvList=[]; 
                              dataObjEnvList.push(k);
                              dataObjEnvList.push(v);
                              dataObj.push(dataObjEnvList)
                          });
	                      	  $scope.envdata=dataObj;
	                      	  $scope.viewby = 5;
		                      $scope.totalItems =envListDataLength;
		                      $scope.currentPage = 1;
		                      $scope.itemsPerPage = $scope.viewby;
		                      $scope.maxSize = envListDataLength/5;
			                }

		                  
			  });
   	 }
    	 
}


 var enviVarLoadDetail= function() {
						userDataEnv="system";
    	   		        $rootScope.envdata="";
			            $http({
							url: "/showEnvironmentVariablesData",
							method: "POST",
							data:{serverIp:ip},
							headers: {"Content-Type": "application/json"}
				        })
				        .success(function(data){
                         if (data!=null) {
	                          var data = JSON.parse(data[0].envVars);
					          var envListDataLength = Object.keys(data.envList).length; 
					          var dataObj=[];
					          userDataEnv="system"
					          var dataEnv=data.envList;
				             $.each(dataEnv, function(k, v) {
						          	var dataObjEnvList=[];
		                            console.log(k + ' is ' + v);
		                            dataObjEnvList.push(k);
		                            dataObjEnvList.push(v);
		                            dataObj.push(dataObjEnvList)
                               });
		                      	  $scope.envdata=dataObj;
		                      	  $scope.viewby = 5;
			                      $scope.totalItems =envListDataLength;
			                      $scope.currentPage = 1;
			                      $scope.itemsPerPage = $scope.viewby;
			                      $scope.maxSize = envListDataLength/5;
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