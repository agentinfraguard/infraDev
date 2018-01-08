angular.module("userListController", ['ui.bootstrap']).controller("userListController", 
function($scope, $http, $rootScope, companyService, $window, $timeout, $document) {

	$scope.visible = false;
	$rootScope.visibleUserList =true;
	// $rootScope.visible_Process_List = false;
	// $rootScope.enviromentVariable = false;
	// $rootScope.visible_audit_Login = false;
	// $rootScope.visibleUnlockEachServer= false;
 //    $rootScope.visibleLockdownEachServer= false;
	// $rootScope.visibleGetAccessKey = false;
 //    $rootScope.visibleGetAccessKeyEachPage  = false;
	// $rootScope.visibleRunScript = false;
	$rootScope.visibleRootAccess  = false;
	$rootScope.visibleAllReadyUser  = false;
	$rootScope.visibleDeleteUser = false;
	$rootScope.visible_AddUser = false;
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
	 	 	 $rootScope.serverName=data.serverDetail.serverName;
	 		 $rootScope.user=data.serverDetail.userList;
	 		 $rootScope.lockdownServerDetail1=data.serverDetail.lockedDown;
	 		 $rootScope.hostNameDetails=data.serverDetail.hostname;
	 		 $rootScope.serverIpDetails=data.serverDetail.serverIP;
	 		 $rootScope.ServerIPpublic=data.serverDetail.publicIP;
	 		 var cpuDetail=data.serverDetail.cpu.split(",");
	 		 $rootScope.cpu=cpuDetail[0];
	 		 $rootScope.cpuDetails=data.serverDetail.cpu;
	 		 $rootScope.ramDetails=data.serverDetail.ram;
	 		 var ramDetail=data.serverDetail.ram.split(",");
	 		    ramDetailString=String(ramDetail[0])
	 		    ramDetail=ramDetailString.split(":")
	 		 $rootScope.ram="Total  "+ramDetail[1];
	 		 var KeyRotationDetails=data.serverDetail.autoKeyRotation;
	 		  if(KeyRotationDetails=0){
                   $scope.KeyRotation="User Managed"
	 		    }
	 		  else{
	 		  	   $rootScope.KeyRotation="Auto"
	 		    }
	 		  var lockdownServerDetails=data.serverDetail.lockedDown;
	 		     if(lockdownServerDetails=0){
	 		         $rootScope.LockdownServer="Unlocked"
	 		        }
	 		     else{
                     $rootScope.LockdownServer="Locked"
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
                        $rootScope.userListName=userListDataArr;
  
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
                    $rootScope.modal_class = "modal-backdrop fade in";            
 	            }
 	            else if (accessRoot="user"){
 	                $rootScope.userAccessChange="root"
                     console.log(accessRoot,"accessRoot");
                     $rootScope.visibleAllReadyUser = $rootScope.visibleAllReadyUser ? false : true;
                     $rootScope.modal_class = "modal-backdrop fade in";
                    
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
                     $rootScope.modal_class = "modal-backdrop fade in";
 	                }
 	            else if (accessRoot="user"){
 	            	  $rootScope.userAccessChange="root";
                      $rootScope.routeAccess=userListArr[1];
                      $rootScope.visibleRootAccess = $rootScope.visibleRootAccess ? false : true;
                      $rootScope.modal_class = "modal-backdrop fade in";
 	                }
                
            };


          $scope.deleteUser = function (userListArr) { 
         	      deleteUser=userListArr[0];
                  $rootScope.visibleDeleteUser = $rootScope.visibleDeleteUser ? false : true;
                    $rootScope.modal_class = "modal-backdrop fade in";
                }


   

$rootScope.close = function(value) {

            if(value == "deleteUserOkButton"){ 
         	 console.log(deleteUser)
             $http({
				  url: "/deleteUserFromServer",
				  method: "POST",
				  data: {serverIp:ip,uname:deleteUser,search:1},
				  headers: {"Content-Type": "application/json"}
			   })
			  .success(function(data){
			  	 body.removeClass("overflowHidden");
				 $rootScope.modal_class = "";
			      $rootScope.visibleDeleteUser = $rootScope.visibleDeleteUser ? false : true;
			   });

            }



}

	  $rootScope.open = function(value) {
		          $scope.totalItems ="";
                  $scope.maxSize = ""; 
          if(value == "userOk"){
          	$scope.visible_AddUser = $rootScope.visible_AddUser ? false : true;
				body.removeClass("overflowHidden");
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
                  
         
           else if (value=="deleteUserCancel") {
    	        body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
                $rootScope.visibleDeleteUser = $rootScope.visibleDeleteUser ? false : true;
    	   }
    	   else if (value=="addUserOpen") {
    	   	    $rootScope.modal_class = "modal-backdrop fade in";
                $rootScope.visible_AddUser = $rootScope.visible_AddUser ? false : true;
    	   }

             else if(value == "userCancel"){
             	   body.removeClass("overflowHidden");
				   $rootScope.modal_class = "";
                  $rootScope.visible_AddUser = $rootScope.visible_AddUser ? false : true;

              }
            //  open('userAccessChangeCancel')
               else if(value == "userAccessChangeCancel"){
             	   body.removeClass("overflowHidden");
				   $rootScope.modal_class = "";
                  $rootScope.visibleAllReadyUser = $rootScope.visibleAllReadyUser ? false : true;

              }
               else if(value == "userAccessChangeButton"){
             	
	            $http({
				method: "POST",
				url: "/getUserEmail",
				data: {uname:userListArrUser},
				headers: {"Content-Type":"application/json"}
			})
		       .success(function(data){
		       	 body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
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