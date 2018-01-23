angular.module("auditLoginController", ['ui.bootstrap']).controller("auditLoginController", 
function($scope, $http, $rootScope, companyService, $window) {

	var ip = companyService.getId();
    if(ip==undefined){
 		ip = $window.localStorage.getItem('serverIp');
 	}
 	$window.localStorage.setItem('serverIp', ip);
    companyService.setId(null);

$rootScope.close = function() {
      $http({
				url: "/refreshAuditLogin",
				method: "POST",
				data: {serverIp:ip,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			})
			   .success(function(data){
			      var data=JSON.parse(data[0].auditLogin);
             if(data!==null){
                    data=data.loginHistory;
                    dataAuditloginManipulation(data);
                    var auditLoginDataLen=Object.keys(data).length-2;
                    $rootScope.auditLogin=dataAuditloginManipulation(data);
                        $scope.viewby = 5;
                        $scope.totalItems =auditLoginDataLen;
                        $scope.currentPage = 1;
                        $scope.itemsPerPage = $scope.viewby;
                        $scope.maxSize = auditLoginDataLen/5; 
           
                }
			   });
    	    

}
	  
    var auditLoginPgeLoadDetail= function() {
		             $scope.totalItems ="";
                  $scope.maxSize = ""; 
          	
			          $http({
					         url: "/showAuditLoginData",
				           method: "POST",
					         data: {serverIp:ip},
					          headers: {"Content-Type": "application/json"}
			            })
			          .success(function(data){
			              var data=JSON.parse(data[0].auditLogin);
                    if(data!==null){
			              data=data.loginHistory;
			              dataAuditloginManipulation(data);
			              var auditLoginDataLen=Object.keys(data).length-2;
			              $rootScope.auditLogin=dataAuditloginManipulation(data);
			                  $scope.viewby = 5;
			                  $scope.totalItems =auditLoginDataLen;
			                  $scope.currentPage = 1;
			                  $scope.itemsPerPage = $scope.viewby;
			                  $scope.maxSize = auditLoginDataLen/5; 
			                    }
	                    })
			        }


              auditLoginPgeLoadDetail()
    


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

	
  function dataAuditloginManipulation(data){
                var auditObj=[];
                var auditloginLength = Object.keys(data).length;
                      console.log("dataAuditloginManipulation")
             for(var i=0;i<auditloginLength-2;i++){  
                 var auditLogindataString=String(data[i]);
                 var userName=auditLogindataString.split(" ");
                 userName1=String(userName[0]);//username
                 var terminalName=String(userName);      
                 var terminalName=terminalName.split(userName1);      
                 terminalName=String(terminalName);       
                 terminalName= terminalName.replace(/,/g , " ");     
                 terminalName=terminalName.trim();   
                 terminalName1=terminalName.split(" ");   
                 terminalSystemSearch=terminalName.search("system boot");  
                 var terminalName3;//terminal 
                 if(terminalSystemSearch<=-1){
                     terminalName3=terminalName1[0]
                    }
                 else{
                     terminalName3="system boot";
                    }
                  var serverIp=terminalName.split(terminalName3);
                  serverIp=String(serverIp);
                  serverIp=String(terminalName1).replace(/,/g , " ").split(terminalName3);
                  serverIp=String(serverIp).trim();      
                  var serverip2=serverIp.split(" ");
                  serverip2=String(serverip2)
                  serverip2=serverip2.replace(/,/g , " ").trim();
                  serverip3=serverip2.split(" ",1);
                  serverip2=String(serverip3);//113.193.93.57   
                  var logTime=serverIp.split(serverip2);
                  logTime=String(logTime);       
                  logTime=logTime.replace(/,/g , " ").trim();   
                  logTime=String(logTime);
                  var totalTime,totalTime,logTimeDate
                  var stillRunning=logTime.search("still running")
                  var goneNoLogout=logTime.search("gone - no logout")
                 if (stillRunning>-1) {         
					         totalTime="still running"; 
					         logTime=logTime.split(totalTime)     
					         logTimeDate=logTime[0]  
					         logTimeDate=String(logTimeDate);     
			                }

			            else if(goneNoLogout>-1) {
					         totalTime="gone - no logout";
					         logTime=logTime.split(totalTime)     
					         logTimeDate=logTime[0]  
					         logTimeDate=String(logTimeDate); 
			                }
      
                 else{
                     logTime=logTime.split("(")     
                     logTimeDate=logTime[0]  
                     logTimeDate=String(logTimeDate);       
                     totalTime=logTime[1]
                     totalTime=String(totalTime);
                     totalTime=totalTime.replace(")" , "") 
                    }
   
                      var dataObj=[];
                      dataObj.push(userName1,terminalName3,serverip2,logTimeDate,totalTime);
                      auditObj.push(dataObj)
                }
                      return auditObj;

            }




})