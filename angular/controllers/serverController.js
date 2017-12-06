angular.module("serverController", []).controller("serverController", 
function($scope, $http, $rootScope, companyService, $window, $timeout, $document) {

	$scope.visible = false;
	$scope.servers = "";
	$rootScope.listStatus = false;
	$rootScope.emailValid = true;
	$rootScope.userExist = true;
	$rootScope.userEmail = "";
	$rootScope.user_err_msg = "";
	$rootScope.privilege = "user";
	$rootScope.visible_server = false;
	$rootScope.visible_command = false;
	$rootScope.visibleLockdown = false;
	$rootScope.visibleUnlock = false;
	$rootScope.visibleProcessList = false;
	$rootScope.visibleGetAccessKey = false;
	$rootScope.visibleauditLogin = false;
	$rootScope.visible_run_script = false;
    $rootScope.server_err_msg = "";
	$scope.users = [];
	var serverName = "";
	var local_index = -1;
	var body = angular.element($document[0].body);
	var ip_addr = "";
	var user_obj = {};
	var emailPattern = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
    //var mailUserCredentialsUrl="";
    //var serverPageDetailsUrl="";
    $scope.createStyle={display:'none'};
    var sCount = true;

    $scope.showOptions = function(index) {
		if(local_index != index){
			$scope.visible = false;
		}
		local_index = index;
		$scope.visible = $scope.visible ? false : true;
	};

 	var id = companyService.getId();
 	if(id==undefined){
 		id = $window.localStorage.getItem('projectId');
 		}
 	$window.localStorage.setItem('projectId', id);
    companyService.setId(null);

	var loadTime = 5000, //Load the data every second
    errorCount = 0, //Counter for the server errors
    loadPromise; //Pointer to the promise created by the Angular $timeout service

	  var getData = function() {
	   
		$http({
		method : "post",
		url : "/getServerPageDetails",
		headers : {"Content-Type" : "application/json"},
		data : {id : id}
		})
		/*$http({
		method : "get",
		url : serverPageDetailsUrl+"?id="+id,
		})*/
		.success(function(data) {
			$scope.project = data.project;

			if(data.servers == null && sCount==true){
					$scope.createStyle={display:'block'};
					sCount=false;
				}
				
			for(var x in data.servers){
				var users = [];
				data.servers[x].users = [];
				if(data.servers[x].userList != null)
				users = data.servers[x].userList.toString().split(",");
				data.servers[x].users = users;
			}
			$scope.servers = data.servers;
			if($scope.servers == null){
				$scope.servers = [];
			}
			errorCount = 0;
			nextLoad();
  		 });

	  };

	  var cancelNextLoad = function() {
	    $timeout.cancel(loadPromise);
	  };

	  var nextLoad = function(mill) {
	    mill = mill || loadTime;
	    //Always make sure the last timeout is cleared before starting a new one
	    cancelNextLoad();
	    loadPromise = $timeout(getData, mill);
	  };

	  //Start polling the server by getData() first fetch url from properties file
	  /*$http.get('environment.properties').then(function (response) {
        mailUserCredentialsUrl = response.data.mailUserCredentialsUrl;
        serverPageDetailsUrl = response.data.serverPageDetailsUrl;
        getData();
        });*/
	  getData();

	  //Always clear the timeout when the view is destroyed, otherwise it will keep polling
	  $scope.$on('$destroy', function() {
	    cancelNextLoad();
	  });

	  $rootScope.close = function(value) {
	  	if(value == "user_ok"){
			var required_cond = $rootScope.emailForm.userEmail.$error.required;
			$rootScope.listStatus = false;
			$rootScope.users = [];
			if(emailPattern.test($rootScope.userEmail)){
				$rootScope.emailValid = true;
			}
			else{
				$rootScope.emailValid = false;	
			}
			
			if (required_cond == undefined && $rootScope.emailValid) {
			$http({
				url: "/addUserToServer",
				method: "POST",
				data: user_obj,
				headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
				$rootScope.visible_add_user = $rootScope.visible_add_user ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
					if(user_obj.search ==2){
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
		else if(value == "user_cancel"){
			$rootScope.visible_add_user = $rootScope.visible_add_user ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
		}
		else if(value == "deleteUserOk"){
			var required_cond = $rootScope.deleteUserForm.userName.$error.required;
			$rootScope.listStatus = false;
			$rootScope.users = [];
			if (required_cond == undefined) {
			$http({
				url: "/deleteUserFromServer",
				method: "POST",
				data: user_obj,
				headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
				if(data.success == 0){
					$rootScope.userExist = false;
				}
				else{
				$rootScope.visible_delete_user = $rootScope.visible_delete_user ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
				$rootScope.userExist = true;
				}
			});

			}
			
		}
		else if(value == "deleteUserCancel"){
			$rootScope.visible_delete_user = $rootScope.visible_delete_user ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
		} 
		else if(value == "serverLockdownCancel"){

			$rootScope.visibleLockdown = $rootScope.visibleLockdown ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
		}
	
		else if(value == "serverLockdownOk"){
            $rootScope.visibleLockdown = $rootScope.visibleLockdown ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
			var data = {serverIp: ip_addr};
			$http({
			url: "/lockDownServer",
			method: "POST",
			data: data,
			headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
								
			});
		}
		else if(value == "serverUnlockCancel"){

			$rootScope.visibleUnlock = $rootScope.visibleUnlock ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
		}
		else if(value == "serverUnlockOk"){
            $rootScope.visibleUnlock = $rootScope.visibleUnlock ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
			var data = {serverIp: ip_addr};
			$http({
			url: "/unlockServer",
			method: "POST",
			data: data,
			headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
								
			});
		}
		else if(value == "privilegeOk"){
			var required_cond = $rootScope.privilegeForm.userName.$error.required;
			user_obj.userRole = $rootScope.privilege;
			if(required_cond == undefined) {
			$http({
				url: "/changeUserPrivilege",
				method: "POST",
				data: user_obj,
				headers: {"Content-Type": "application/json"}
			})
			.success(function(data){

				if(data.success == 0){
					$rootScope.userExist = false;
				}
				else {
				$rootScope.visible_privilege = $rootScope.visible_privilege ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
				$rootScope.userExist = true;
				}
			});

			}
		}

		else if(value == "enviromentVariable_cancel"){//for enviroment variable

			$rootScope.enviroment_variable = $rootScope.enviroment_variable ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
		}
		else if(value == "privilegeCancel"){
			$rootScope.visible_privilege = $rootScope.visible_privilege ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
		}

		else if(value == "server_cancel"){
				$rootScope.visible_server = $rootScope.visible_server ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
			}
		else if(value == "server_ok"){
					var sname = "";
					$rootScope.errName = false;
					sname = $rootScope.serverName;
					if(sname == undefined || sname.trim().length <= 0){
						$rootScope.errName = true;
						return;
					}else{
						$rootScope.errName = false;
						serverName = sname.trim();
						$rootScope.visible_server = false;
						body.removeClass("overflowHidden");
						$rootScope.modal_class = "";
						$scope.showCommandModal();
					}
				
			}
			else if(value == "command"){
				$rootScope.visible_command = $rootScope.visible_command ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
			}
			else if(value == "processListCancel"){

			$rootScope.visibleProcessList = $rootScope.visibleProcessList ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
			}
			else if(value == "processListOk"){
	            $rootScope.visibleProcessList = $rootScope.visibleProcessList ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
	
			}
			else if(value == "auditLoginCancel"){

			$rootScope.visibleauditLogin = $rootScope.visibleauditLogin ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
			}
			else if(value == "auditLoginOk"){
	            $rootScope.visibleauditLogin = $rootScope.visibleauditLogin ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
	
			}
			else if(value == "getAccessKeyCancel"){

			$rootScope.visibleGetAccessKey = $rootScope.visibleGetAccessKey ? false : true;
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
			}
			else if(value == "getAccessKeyOk"){
				console.log(" ip_addr = : "+ip_addr);
	            $rootScope.visibleGetAccessKey = $rootScope.visibleGetAccessKey ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
				// call method to generate new access key-pair and update agentActivities
				$http({
				url: "/requestServerAccess",
				method: "POST",
				data: {serverIp:ip_addr,name:$rootScope.name},

				headers: {"Content-Type": "application/json"}
				})
				.success(function(data){
					
					

				});
			}

			else if(value == "refreshEnvVars"){
				console.log("refreshEnvVars clicked");
			$http({
				url: "/refreshEnvironmentVars",
				method: "POST",
				data: {serverIp:ip_addr,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
			  console.log(data);
			});
    	   }

    	   else if(value == "refreshProcessList"){
    	   	console.log("refreshProcessList clicked");
			$http({
				url: "/refreshProcessList",
				method: "POST",
				data: {serverIp:ip_addr,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
			  console.log(data);
			});
    	   }
    	   else if(value == "refreshauditLogin"){
    	   	console.log("refreshauditLogin clicked");
			$http({
				url: "/refreshAuditLogin",
				method: "POST",
				data: {serverIp:ip_addr,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
			  console.log(data);
			});
    	   }
           else if(value == "runScript_cancel"){
	            $rootScope.visible_run_script = $rootScope.visible_run_script ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
	
			}
            else if(value == "runScript_ok"){
				$rootScope.visible_run_script = $rootScope.visible_run_script ? false : true;
		     $http({
				url: "/runSriptOnServer",
				method: "POST",
				data: {serverIp:ip_addr,script:$rootScope.runScript,name:$rootScope.name},
				headers: {"Content-Type": "application/json"}
			 })
			.success(function(data){
			  console.log(data);
			});
    	   }


	};


	$scope.showCommandModal = function() {
			$rootScope.visible_command = $rootScope.visible_command ? false : true;
			if ($rootScope.visible_command) {
				// install agent from production repository 
				//$rootScope.commandText = "bash <(wget -qO- https://raw.githubusercontent.com/agentinfraguard/agent/master/scripts/agentInstaller.sh --no-check-certificate) '"+serverName+"' "+ $scope.project.id+" "+"LicenseKey";
				// install agent from development repository
				$rootScope.commandText = "bash <(wget -qO- https://raw.githubusercontent.com/spiyushk/agent/master/scripts/agentInstaller.sh --no-check-certificate) '"+serverName+"' "+ $scope.project.id+" "+"LicenseKey";
				body.addClass("overflowHidden");
				$rootScope.modal_class = "modal-backdrop fade in";
			} else {
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
			}
	};

	$scope.showServerModal = function() {
			$rootScope.visible_server = $rootScope.visible_server ? false : true;
			$rootScope.errName = false;
			$rootScope.serverName = "";
			$rootScope.server_err_msg = "";
			if ($rootScope.visible_server) {
				body.addClass("overflowHidden");
				$rootScope.modal_class = "modal-backdrop fade in";
			} else {
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
			}
		};
		
	$scope.showUserModal = function(mode, ip) {
		
		ip_addr = ip;
		if (mode == "adduser") {
			$rootScope.visible_add_user = $rootScope.visible_add_user ? false : true;
		} else if(mode == "deleteuser"){
			$rootScope.visible_delete_user = $rootScope.visible_delete_user ? false : true;
		} else if(mode == "changeprivilege"){
			$rootScope.visible_privilege = $rootScope.visible_privilege ? false : true;
		} else if(mode == "serverLockdown"){
			$rootScope.visibleLockdown = $rootScope.visibleLockdown ? false : true;
		}else if(mode == "serverUnlock"){
			$rootScope.visibleUnlock = $rootScope.visibleUnlock ? false : true;
		}else if(mode == "getAccessKey"){
			$rootScope.visibleGetAccessKey = $rootScope.visibleGetAccessKey ? false : true;
		}
		else if(mode == "enviromentVariable"){
			$rootScope.user = "";
			$rootScope.envdata = "";
		    $http({
				url: "/showEnvironmentVariablesData",
				method: "POST",
				data: {serverIp:ip_addr},
				headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
				//console.log(data);
				var data = JSON.parse(data[0].envVars);
				$rootScope.enviroment_variable = $rootScope.enviroment_variable ? false : true;
            if (data!=null) {
				//enviroment
	            //var data={"envList":{"GOBIN":"$GOPATH/bin","GOPATH":"$HOME/go_workspace","GOROOT":"/usr/lib/go-1.6","PATH":"$PATH:$GOROOT/bin:$GOBIN","VAR":"HELLO_WORLD"}}            
	            $rootScope.user = "SYSTEM";  
	           	$rootScope.envdata=data.envList;
			  }
			});

		}
		else if(mode == "processList"){
			$rootScope.processLstdata = "";
			$rootScope.processLst = "";
			$http({
				url: "/showProcessListData",
				method: "POST",
				data: {serverIp:ip_addr},
				headers: {"Content-Type": "application/json"}
			})
			.success(function(data){
                  
              // console.log(data[0].processList);
			   $rootScope.visibleProcessList = $rootScope.visibleProcessList ? false : true;
               
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
		          // console.log(datasplit);
	            }
                 $rootScope.processLst=dataObj;

                  }
              
        
			});
		}
  else if(mode == "auditLogin"){
			$rootScope.visibleauditLogin = $rootScope.visibleauditLogin ? false : true;
			  //  $http({
			 //  	url: "/showAuditLoginData",
		    // 	    method: "POST",
			//  	data: {serverIp:ip_addr},
			//  	headers: {"Content-Type": "application/json"}
			// })
			// success(function(data){
			// 	console.log(data)

			// $rootScope.dataAuditlogin=obj.loginHistory;
  var data={"0":"reboot   system boot  0.0.0.0          Wed Nov 29 11:11:31 2017 - Wed Nov 29 19:56:45 2017  (08:45)","1":"saurabh  tty7         0.0.0.0          Fri Dec  1 11:33:14 2017   gone - no logout","2":"saurabh  tty1         0.0.0.0          Fri Nov 24 17:23:03 2017 - Fri Nov 24 17:23:07 2017  (00:00)","3":"reboot   system boot  0.0.0.0          Fri Dec  1 11:32:01 2017   still running","4":"ec2-user pts/0        113.193.92.175   Tue Nov 14 09:50 - 11:49  (01:59)","5":"root     pts/1        113.193.92.175   Mon Nov 13 13:42 - 13:42  (00:00)","6":"ec2-user pts/1        113.193.92.175   Tue Nov 14 08:16 - 10:28  (02:12)","7":"reboot   system boot  3.10.0-693.el7.x Mon Nov 13 13:06 - 11:29 (20+22:22)","8":"saurabh  tty1         0.0.0.0          Fri Nov 24 17:23:03 2017 - Fri Nov 24 17:23:07 2017  (00:00)","9":"reboot   system boot  0.0.0.0          Mon Nov 27 11:06:33 2017 - Mon Nov 27 20:08:17 2017  (09:01)","10":"saurabh  tty1         0.0.0.0          Fri Nov 24 17:23:03 2017 - Fri Nov 24 17:23:07 2017  (00:00)"}
 dataAuditloginManipulation(data);
 function dataAuditloginManipulation(data){
  var auditObj=[];
  var auditloginLength = Object.keys(data).length;
  for(var i=0;i<auditloginLength;i++){
//    console.log(data[i])
   //  var dataTrim,result3,terminalName,result15,result19,serverIpsplitFifth;    
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
      //console.log(terminalSystemSearch)
      terminalName3=terminalName1[0]

     }
     else{
        //console.log(terminalSystemSearch+"terminalSystemSearch")
        terminalName3="system boot";
     }
      //console.log(terminalName3)
     var serverIp=terminalName.split(terminalName3);

     serverIp=String(serverIp);
     serverIp=String(terminalName1).replace(/,/g , " ").split(terminalName3);
     serverIp=String(serverIp).trim();      
    // console.log(serverIp.split(" "))
     var serverip2=serverIp.split(" ");
     serverip2=String(serverip2)
     serverip2=serverip2.replace(/,/g , " ").trim();
     serverip3=serverip2.split(" ",1);
     serverip2=String(serverip3);//113.193.93.57   
     var logTime=serverIp.split(serverip2);
      logTime=String(logTime);       
      logTime=logTime.replace(/,/g , " ").trim();   
      logTime=String(logTime);
       console.log(logTimeDate)
     var totalTime,totalTime,logTimeDate
     var stillRunning=logTime.search("still running")
     var goneNoLogout=logTime.search("gone - no logout")
      if (stillRunning>-1) {
          
         totalTime="still running";
         console.log(stillRunning)
       
      }

      else if(goneNoLogout>-1) {

       totalTime="gone - no logout";

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
      $rootScope.auditLogin=dataAuditloginManipulation(data);

	}
	else if(mode == "runScript"){
			$rootScope.visible_run_script = $rootScope.visible_run_script ? false : true;
		}



		$rootScope.errName = false;
		$rootScope.listStatus = false;
		$rootScope.userEmail = "";
		$rootScope.user_err_msg = "";
		$rootScope.userName = "";
		$rootScope.emailValid = true;
		$rootScope.userExist = true;
		if ($rootScope.visible_add_user || $rootScope.visible_delete_user || 
			$rootScope.visible_privilege) {
			body.addClass("overflowHidden");
			$rootScope.modal_class = "modal-backdrop fade in";
		}
		else {
			body.removeClass("overflowHidden");
			$rootScope.modal_class = "";
		}
	};

	$rootScope.showUsers = function(){
		var userEmail = "%" + $rootScope.userEmail + "%";
		var data = {email: userEmail};
		user_obj = {};
		user_obj.user = {};
		if(emailPattern.test($rootScope.userEmail)){
			$rootScope.emailValid = true;
		}
		else{
			$rootScope.emailValid = false;	
		}
		
		$http({
			url: "/showUsers",
			method: "POST",
			data: data,
			headers: {"Content-Type": "application/json"}
			
		})
		.success(function(data){
			
			if(data.length > 0){
				$rootScope.users = data;
				$rootScope.listStatus = true;
			}
			else{
				$rootScope.users = [];
				$rootScope.listStatus = false;	
			}	
				user_obj.search = 2;
				user_obj.serverIp = ip_addr;
				user_obj.user.uname = $rootScope.userEmail;
				user_obj.user.linuxName = $rootScope.userEmail;
				if($rootScope.userEmail != undefined && $rootScope.userEmail.indexOf("@") > -1){
					user_obj.user.uname = $rootScope.userEmail.split("@")[0];
					user_obj.user.linuxName = $rootScope.userEmail.split("@")[0];
				}
				user_obj.user.email = $rootScope.userEmail;
				user_obj.user.passw = generatePassw(8, "#aA!");
				user_obj.user.shell = "/bin/bash";
				user_obj.user.userRegistration = "InfraGuard";

		});
		

	};

	$rootScope.showDeleteUsers = function(){
		var data = {serverIp: ip_addr};
		user_obj = {};
		$rootScope.userExist = true;
		$http({
			url: "/showUsersOnServer",
			method: "POST",
			data: data,
			headers: {"Content-Type": "application/json"}
			
		})
		.success(function(data){
			if(data.length > 0){
				$rootScope.users = data[0].userList.split(",");
				$rootScope.listStatus = true;
				user_obj.search = 2;
				user_obj.serverIp = ip_addr;
				user_obj.uname = $rootScope.userName;
			}
			else{
				user_obj.search = 0;
				user_obj.serverIp = ip_addr;
				user_obj.uname = $rootScope.userName;
			}
			
		});
		
	};

	$rootScope.showPrivilegeUsers = function(){
		var data = {serverIp: ip_addr};
		user_obj = {};
		$http({
			url: "/showPrivilegeUsers",
			method: "POST",
			data: data,
			headers: {"Content-Type": "application/json"}
			
		})
		.success(function(data){
			if(data.length > 0){
				$rootScope.users = data[0].userList.split(",");
				$rootScope.listStatus = true;
				user_obj.search = 2;
				user_obj.serverIp = ip_addr;
				user_obj.uname = $rootScope.userName;
				user_obj.userRole = $rootScope.privilege;
			}
			else{
				user_obj.search = 0;
				user_obj.serverIp = ip_addr;
				user_obj.uname = $rootScope.userName;
				user_obj.userRole = $rootScope.privilege;
			}
			
		});
		
	};

	$rootScope.setUser = function(user){
		$rootScope.listStatus = false;
		$rootScope.users = [];
		user_obj.user = user;
		user_obj.serverIp = ip_addr;
		user_obj.search = 1;
		$rootScope.userEmail = user.email;
		if(emailPattern.test($rootScope.userEmail)){
			$rootScope.emailValid = true;
		}
		else{
			$rootScope.emailValid = false;	
		}

	};

	$rootScope.setDeleteUser = function(user){
		$rootScope.listStatus = false;
		$rootScope.users = [];
		$rootScope.userName = user;
		user_obj = {};
		user_obj.uname = user;
		user_obj.serverIp = ip_addr;
		user_obj.search = 1;

	};

	$rootScope.setPrivilegeUser = function(user){
		$rootScope.listStatus = false;
		$rootScope.users = [];
		$rootScope.userName = user;
		user_obj = {};
		user_obj.uname = user;
		user_obj.serverIp = ip_addr;
		var data = {uname: $rootScope.userName};
		$http({
			method: "POST",
			url: "/getUserEmail",
			data: data,
			headers: {"Content-Type":"application/json"}
		})
		.success(function(data){
			if(data != null){
			user_obj.userEmail = data;
			}else{
				user_obj.userEmail = "";
			}
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


});