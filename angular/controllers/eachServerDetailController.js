angular.module("eachServerDetailController", ['ui.bootstrap']).controller("eachServerDetailController", 
function($scope, $http, $rootScope, companyService, $window, $timeout, $document) {

	$scope.visible = false;
	$rootScope.visibleUserList =true;
	$rootScope.visible_Process_List = false;
	$rootScope.enviromentVariable = false;
	$rootScope.visible_audit_Login = false;
	$rootScope.visibleUnlockEachServer= false;
    $rootScope.visibleLockdownEachServer= false;
	$rootScope.visibleGetAccessKey = false;
    $rootScope.visibleGetAccessKeyEachPage  = false;
	$rootScope.visibleRunScript = false;
	$rootScope.visibleRootAccess  = false;
	$rootScope.visibleAllReadyUser  = false;
	$rootScope.visibleDeleteUser = false;
	$rootScope.visibleAddUser = false;
	$rootScope.listStatus = false;
	$scope.users = [];
	var accessUser="";
	var user_obj = {};
	var emailPattern = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
	var deleteUser="";
	var userListArrUser="";
	var local_index = -1;
	var body = angular.element($document[0].body);
    var user=[];
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
	 		 var cpuDetail=data.serverDetail.cpu.split(",");
	 		 $scope.cpu=cpuDetail[0];
	 		 $scope.cpuDetails=data.serverDetail.cpu;
	 		 $scope.ramDetails=data.serverDetail.ram;
	 		 var ramDetail=data.serverDetail.ram.split(",");
	 		    ramDetailString=String(ramDetail[0])
	 		    ramDetail=ramDetailString.split(":")
	 		 $scope.ram="Total  "+ramDetail[1];
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
	 		      var userListData=data.serverDetail.userList;
                      userListData=userListData.split(",");
                      var userListDataArr=[];
                      for(var i=0;i<userListData.length;i++){
                      	  var userListArr=[];
                      	 if(userListData[i] !="syslog"){
                      	     userListArr.push(userListData[i])
                      	     userListArr.push(data.userdata[i].privilegeStatus);
                      	     userListDataArr.push(userListArr)
                      	    }
                        }
                        $scope.userListName=userListDataArr;
  
            })

    }
 
    serverDetails();

         $scope.GetDetailsindex = function (userListArr) {
 	             var accessRoot=""
 	             var userName=userListArr;
 	             accessRoot=userListArr[1];
 	             userListArrUser=userListArr[0];
 	             accessUser="root";
 	            if(accessRoot=="root"){
 	            	$rootScope.userAccessChange="user"
 	                $rootScope.routeAccess=userListArr[1];
                    $rootScope.visibleRootAccess = $rootScope.visibleRootAccess ? false : true;
                                 
 	            }
 	            else if (accessRoot="user"){
 	                $rootScope.userAccessChange="root"
                     console.log(accessRoot,"accessRoot");
                     $rootScope.visibleAllReadyUser = $rootScope.visibleAllReadyUser ? false : true;
                    
 	            }
                
            };

         $scope.GetDetailsindexUser = function (userListArr) {
 	            var accessRoot="";
 	            var userName=userListArr;
 	            userListArrUser="";
 	            accessRoot=userListArr[1];
 	            userListArrUser=userListArr[0];
 	             accessUser="user";
 	            if(accessRoot=="root"){
                     $rootScope.userAccessChange="user";
                     $rootScope.visibleAllReadyUser = $rootScope.visibleAllReadyUser ? false : true;
 	                }
 	            else if (accessRoot="user"){
 	            	  $rootScope.userAccessChange="root";
                      $rootScope.routeAccess=userListArr[1];
                      $rootScope.visibleRootAccess = $rootScope.visibleRootAccess ? false : true;
 	                }
                
            };


          $scope.deleteUser = function (userListArr) { 
         	      deleteUser=userListArr[0];
                  $rootScope.visibleDeleteUser = $rootScope.visibleDeleteUser ? false : true;
                }


   

$rootScope.close = function(value) {

      if(value == "refreshProcessListButton"){
    	 
			$http({
				url: "/refreshAuditLogin",
				method: "POST",
				data: {serverIp:ip,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			})
			   .success(function(data){
			         $rootScope.visibleUserList = $rootScope.visibleUserList ?false : true;
                     var obj=JSON.parse(data[0].processList);
                     if (obj!=null) {
                          $rootScope.processLstdata=obj.processLst;
                          var processDataLength = Object.keys($rootScope.processLstdata).length;             
	                      var dataObj=[];               
	                      for(var k=7;k<processDataLength;k++){
		                      var datas=obj.processLst[k];
		                      var trimdata=datas.trim();
		                      var datareplace=trimdata.replace(/\s+/g,' ');
		                      var datasplit=datareplace.split(" ");
		                       dataObj.push(datasplit);
	                        }

                            $rootScope.processLst=dataObj;
                            $scope.viewby = 10;
                            $scope.totalItems =processDataLength-1;
                            $scope.currentPage = 1;
                            $scope.itemsPerPage = $scope.viewby;
                            $scope.maxSize = processDataLength/10; //Number of pager buttons to show
                        }
			   });
    	}

        else if(value == "envVarUserSpecificEach"){
    	   		userDataEnv="user";
    	   		$rootScope.envdata="";
    	   		$rootScope.userData =userDataEnv;
				console.log("envVarUserSpecific clicked");
			    //$http({
			   //	url: "/refreshEnvironmentVars",
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
				console.log("envVarSystemSpecific clicked");
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
			
			$http({
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

			   });
    	   }
    	 

		
		 else if(value == "refreshauditLoginButton"){
    	
			$http({
				url: "/refreshAuditLogin",
				method: "POST",
				data: {serverIp:ip,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			})
			   .success(function(data){
			      var data=JSON.parse(data[0].auditLogin);
                  data=data.loginHistory;
                  dataAuditloginManipulation(data);
                  $rootScope.auditLogin=dataAuditloginManipulation(data);
			   });
    	    }

           else if(value == "serverLockdownCancelButton"){

			$rootScope.visibleLockdownEachServer = $rootScope.visibleLockdownEachServer ? false : true;
			
		}
	
		else if(value == "serverLockdownOkButton"){
            $rootScope.visibleLockdownEachServer = $rootScope.visibleLockdownEachServer ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
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
		else if(value == "serverUnlockCancelButton"){

			$rootScope.visibleUnlockEachServer = $rootScope.visibleUnlockEachServer ? false : true;

		}
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
		
          else if(value == "runScriptOkButton"){
		     $http({
				url: "/runSriptOnServer",
				method: "POST",
				data: {serverIp:ip,script:$rootScope.runScriptEachServer,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			 })
			.success(function(data){
			 $rootScope.visibleRunScript = $rootScope.visibleRunScript ? false : true;
            if (data=1) {

            }

			});
    	   }

		else if(value == "getAccessKeyCancelButton"){

			$rootScope.visibleGetAccessKeyEachPage = $rootScope.visibleGetAccessKeyEachPage ? false : true;
		
			}
			else if(value == "getAccessKeyOkButton"){
	            $rootScope.visibleGetAccessKeyEachPage = $rootScope.visibleGetAccessKeyEachPage ? false : true;
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

          else if(value == "userAccessChangeButton"){
           console.log(userListArrUser)
	            $http({
				method: "POST",
				url: "/getUserEmail",
				data: {uname:userListArrUser},
				headers: {"Content-Type":"application/json"}
			})
		       .success(function(data){
			    $rootScope.visibleAllReadyUser = $rootScope.visibleAllReadyUser ? false : true;
				var userEmail=data;
				$http({
					url: "/changeUserPrivilege",
					method: "POST",
					data: {uname:userListArrUser,userEmail:userEmail,userRole:accessUser,serverIp:ip},
					headers: {"Content-Type": "application/json"}
				})
				.success(function(data){
				console.log(data)

		      })
		   });

          }
         
            else if(value == "deleteUserOkButton"){ 
         	 console.log(deleteUser)
             $http({
				  url: "/deleteUserFromServer",
				  method: "POST",
				  data: {serverIp:ip,uname:deleteUser,search:1},
				  headers: {"Content-Type": "application/json"}
			   })
			  .success(function(data){
			      $rootScope.visibleDeleteUser = $rootScope.visibleDeleteUser ? false : true;
			   });

            }


}

	  $rootScope.open = function(value) {
		          $scope.totalItems ="";
                  $scope.maxSize = ""; 
          if(value == "userOk"){
			var required_cond = $scope.emailFormAdd.userEmailAdd.$error.required;
			$scope.listStatus = false;
			$scope.users = [];
			if(emailPattern.test($scope.userEmailAdd)){
				$rootScope.emailValid = true;
			}
			else{
				$rootScope.emailValid = false;	
			}
			
			if (required_cond == undefined && $scope.emailValid) {
				//console.log($rootScope.users = [])
			$http({
				url: "/addUserToServer",
				method: "POST",
				data: user_obj,
				headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
				$scope.visibleAddUser = $rootScope.visibleAddUser ? false : true;
				body.removeClass("overflowHidden");
				$scope.modal_class = "";
					if(user_obj.search ==1){
     				//var userCredentials = {uname : user_obj.user.uname, passw :user_obj.user.passw,email:user_obj.user.email,serverIp:ip_addr};
					var userCredentials = {passw :user_obj.user.passw,email:user_obj.user.email,url:$window.location.host};
						$http({
					 	url : "/mailUserCredentialsUrl",
					 	data : userCredentials,
					 	method : "post",
					 	headers: {'Content-Type': 'application/json'},
					    }).success(function(data){
					 	    });
					}
    		});

			}
			
		}     
                  
         else if(value == "UserList"){
           	   $rootScope.visibleUserList =$rootScope.visibleUserList ? false : true;
            }

          else if(value == "processListOk"){
					$http({
						url: "/showProcessListData",
						method: "POST",
						data: {serverIp:ip},
						headers: {"Content-Type": "application/json"}
					})
					.success(function(data){
					  $rootScope.visibleUserList = $rootScope.visibleUserList ?false : true;
					  $rootScope.visible_Process_List = $rootScope.visible_Process_List ? false : true;
                      var obj=JSON.parse(data[0].processList);
                  
	                  if (obj!=null) {
	                     $rootScope.processLstdata=obj.processLst;
	                     var processDataLength = Object.keys($rootScope.processLstdata).length;      
		                 var dataObj=[];
	                            
	                     for(var k=7;k<processDataLength;k++){
				             var datas=obj.processLst[k];
				             var trimdata=datas.trim();
				             var datareplace=trimdata.replace(/\s+/g,' ');
				             var datasplit=datareplace.split(" ");
				             dataObj.push(datasplit);
	                        }
		                  $rootScope.processLst=dataObj;
		                  $scope.viewby = 5;
		                  $scope.totalItems =processDataLength-7;
		                  $scope.currentPage = 1;
		                  $scope.itemsPerPage = $scope.viewby;
		                  $scope.maxSize = processDataLength/5; //Number of pager buttons to show

                        }
			       });
    	    }   
			
			else if(value == "auditLoginOk"){
		              $rootScope.visibleUserList = $rootScope.visibleUserList ?false : true;
					  $rootScope.visible_audit_Login = $rootScope.visible_audit_Login ? false : true;
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
			              data=data.loginHistory;
			              dataAuditloginManipulation(data);
			              var auditLoginDataLen=Object.keys(data).length-2;
			              $rootScope.auditLogin=dataAuditloginManipulation(data);
			                  $scope.viewby = 5;
			                  $scope.totalItems =auditLoginDataLen;
			                  $scope.currentPage = 1;
			                  $scope.itemsPerPage = $scope.viewby;
			                  $scope.maxSize = auditLoginDataLen/5; 
			     
	                    })
			        }
		
		   else if(value == "enviromentVariable_ok"){//for enviroment variable
			            $rootScope.visibleUserList = $rootScope.visibleUserList ?false : true;
						$rootScope.enviromentVariable = $rootScope.enviromentVariable ? false : true;
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

    	 
    	   else if(value == "serverLockdownOk"){    	
			    
			     $rootScope.visibleUnlockEachServer = $rootScope.visibleUnlockEachServer ? false : true;
		     
    	       }
    	   else if(value == "serverUnlockOk"){
				 
				 $rootScope.visibleLockdownEachServer = $rootScope.visibleLockdownEachServer ? false : true; 
    	   }

    	   else if(value == "runScriptOk"){
            	
            	$rootScope.visibleRunScript = $rootScope.visibleRunScript ? false : true;
    	   }
                
           else if(value == "getAccessKeyOK"){
            	
            	$rootScope.visibleGetAccessKeyEachPage  = $rootScope.visibleGetAccessKeyEachPage ? false : true;
    	   }
    	  
    	   else if (value=="accessRootButton") {
    	   
                $rootScope.visibleRootAccess  = $rootScope.visibleRootAccess ? false : true;

    	   }

           else if (value=="userRootAccessCancel") {

                $rootScope.visibleRootAccess  = $rootScope.visibleRootAccess ? false : true;

    	   }

           else if (value=="userAccessChangeCancel") {
    	   	
                $rootScope.visibleAllReadyUser  = $rootScope.visibleAllReadyUser ? false : true;
    	   }

           else if (value=="deleteUserCancel") {
    	   	
                $rootScope.visibleDeleteUser = $rootScope.visibleDeleteUser ? false : true;
    	   }
    	   else if (value=="addUserOpen") {
    	   	
                $rootScope.visibleAddUser = $rootScope.visibleAddUser ? false : true;
    	   }

             else if(value == "userCancel"){
                  $rootScope.visibleAddUser = $rootScope.visibleAddUser ? false : true;

              }


  //       $scope.errName = false;
		// $scope.listStatus = false;
		// $scope.userEmailAdd = "";
		// $scope.user_err_msg = "";
		// $scope.userName = "";
		// $scope.emailValid = true;
		// $scope.userExist = true;
		// if ($scope.visible_add_user || $rootScope.visible_delete_user || 
		// 	$scope.visible_privilege) {
		// 	body.addClass("overflowHidden");
		// 	$rootScope.modal_class = "modal-backdrop fade in";
		// }
		// else {
		// 	body.removeClass("overflowHidden");
		// 	$rootScope.modal_class = "";
		// }



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

	};
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

$scope.showUsers = function(){
		var userEmailAdd = "%" + $scope.userEmailAdd + "%";
		var data = {email: userEmailAdd};
		user_obj = {};
		user_obj.user = {};
		if(emailPattern.test($scope.userEmailAdd)){
			$scope.emailValid = true;
		}
		else{
			$scope.emailValid = false;	
		}
		
		$http({
			url: "/showUsers",
			method: "POST",
			data: data,
			headers: {"Content-Type": "application/json"}
			
		})
		.success(function(data){
			
			if(data.length > 0){
				$scope.users = data;
				$scope.listStatus = true;
			}
			else{
				$scope.users = [];
				$scope.listStatus = false;	
			}	
				user_obj.search = 2;
				user_obj.serverIp = ip;
				user_obj.user.uname = $rootScope.userEmailAdd;
				user_obj.user.linuxName = $scope.userEmailAdd;
				if($scope.userEmailAdd != undefined && $scope.userEmailAdd.indexOf("@") > -1){
					user_obj.user.uname = $scope.userEmailAdd.split("@")[0];
					user_obj.user.linuxName = $scope.userEmailAdd.split("@")[0];
				}
				user_obj.user.email = $scope.userEmailAdd;
				user_obj.user.passw = generatePassw(8, "#aA!");
				user_obj.user.shell = "/bin/bash";
				user_obj.user.userRegistration = "InfraGuard";

		});
		

	};

	function generatePassw(size, mode) {
    var mask = '';
    if (mode.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (mode.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (mode.indexOf('#') > -1) mask += '0123456789';
    if (mode.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = size; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}

})