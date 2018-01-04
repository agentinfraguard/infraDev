angular.module("profileController", []).controller("profileController",
	function($scope, $http, $rootScope, companyService, $document, $timeout, $window){
     	$scope.edit = true;
     	$scope.uploadSuccess = false;
     	$scope.keySuccess = false;
     	$scope.ssh_err_display = false;
     	$scope.ssh_err_msg = "";
     	$scope.infoSuccess = false;
     	$scope.shell = "/bin/bash";
     	$scope.visible = false;
     	$rootScope.visible_help = false;
     	$rootScope.visible_company = false;
     	$rootScope.visible_project = false;
     	$rootScope.visibleEditCompanyName=false;
     	$rootScope.visibleDeleteCompanyName=false;
     	$rootScope.company_err_msg = "";
     	$rootScope.modal_class = "";
     	$rootScope.userAccounts = JSON.parse($window.localStorage.getItem('userAccounts'));
     	$rootScope.currentAccountId=$window.localStorage.getItem('currentAccount');
     	var local_index = -1;
     	var body = angular.element($document[0].body);
     	$scope.createStyle = false;
		$scope.mfaStyle = false;
		$scope.companyId ="";
        $rootScope.companyName="";
     	$rootScope.getAccountData = function(accountId,accountOwnerId) {
			console.log(" accountId = : "+accountId+" Account Owner Id = : "+accountOwnerId+" Current User = : "+$window.localStorage.getItem('loggedInUser'));
			$window.localStorage.setItem('currentAccount', accountId);
			$window.localStorage.setItem('currentAccountOwner', accountOwnerId);
			$rootScope.currentAccountId = accountId;
			getAccountDetails(accountId,accountOwnerId);
		};

		$rootScope.addFunction = function() {
			showCompanyModal();
		}

  

     	var getAccountDetails = function(accountId,accountOwnerId){
     		$http({
			url : "/getUserData",
			method : "POST",
			headers : {"Content-Type" : "application/json"},
		    data : {accountId : accountId,accountOwnerId:accountOwnerId}
			})
			.success(function(data){

				if(data.userdata == null){
					$window.location.href = "/";
				}

				$scope.userId = data.userdata.id;
				$scope.name = data.userdata.uname;
				$scope.email = data.userdata.email;
				$rootScope.name=data.userdata.uname;
				$rootScope.accountname=data.accountdata[0].accountName;

				$scope.ssh_key = data.userdata.ssh_key;
				
				if(data.userdata.mfaEnabled == 0){
					$scope.mfaStyle = true;
				}
				if(data.companydata == null){
					$scope.createStyle = true;
				}

            // filter data to display based on policies
            if(data.userroles != null){
            	console.log(" Userroles = : "+data.userroles);
                console.log(" Policies = : "+JSON.parse(data.userroles)[0].policy);
           }
				for(var x in data.companydata){
					var projects = [];
					data.companydata[x].projects = [];
					for(var y in data.projectdata){
						if(data.projectdata[y].companyId == data.companydata[x].id){
							projects.push(data.projectdata[y]);
							data.companydata[x].projects = projects;
						}
					}
				}
				$rootScope.companies = data.companydata;	
				
				if (typeof data.userdata.shell !== "undefined" && data.userdata.shell != "" && data.userdata.shell != null) {
                   $scope.shell = data.userdata.shell;
                }
				
				if (typeof data.userdata.linuxName !== "undefined" && data.userdata.linuxName != "" && data.userdata.linuxName != null) {
                    $scope.linuxName=data.userdata.linuxName;
                }else{
                	$scope.linuxName=data.userdata.uname;
                }
        	});
		};
getAccountDetails($window.localStorage.getItem('currentAccount'),$window.localStorage.getItem('currentAccountOwner'));
		$scope.editUser = function() {
			$scope.edit = false;
		};

		$scope.saveUser = function() {
			$scope.edit = true;
			$http({
				method : "POST",
				url : "/save_profile_info",
				data : {shell : $scope.shell, linux_uname : $scope.linuxName},
				headers : {"Content-Type" : "application/json"}
			})
			.success(function(data) {
				if (data.success == 1) {
					$scope.infoSuccess = true;
				} else {
					$scope.infoSuccess = false;
				}
			});
		};

		$scope.upload = function() {
			var file = $scope.user_image;
			var formData = new FormData();
			formData.append("file", file);
			$http({
				method : "post",
				url : "/uploadImage",
				data : formData,
				transformRequest : angular.identity,
				headers: {"Content-Type" : undefined}
			})
			.success(function(data) {
				if(data.success == 1){
					$scope.uploadSuccess = true;
				}
				else{
					$scope.uploadSuccess = false;
				}
			});
		};

		$scope.saveKey = function() {
			var sshKey = $scope.ssh_key;
			$scope.ssh_err_display = false;
     		$scope.ssh_err_msg = "";
     		if(sshKey == "" || sshKey == null){
				$scope.ssh_err_display = true;
				$scope.ssh_err_msg = "SSH Public Key must be filled.";
				return;
			}
			$http({
				method : "POST",
				url : "/updateSSHKey",
				data : {sshKey : sshKey},
				headers : {"Content-Type" : "application/json"}
			})
			.success(function(data) {
				if (data.success == 1) {
					$scope.keySuccess = true;
				} else {
					$scope.keySuccess = false;
				}
			});
		};

		$rootScope.setCompanyId = function(id) {
			companyService.setId(id);
			//console.log(id)
		};

		$rootScope.setProjectId = function(id) {
			companyService.setId(id);
		};

		$scope.showOptions = function(index) {
			if(local_index != index){
				$scope.visible = false;
			}
			local_index = index;
			$scope.visible = $scope.visible ? false : true;
		};

		$scope.showHelpModal = function() {
			$rootScope.visible_help = $rootScope.visible_help ? false : true;
			if ($rootScope.visible_help) {
				body.addClass("overflowHidden");
				$rootScope.modal_class = "modal-backdrop fade in";
			} else {
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
			}
		};
		/*$scope.showCompanyModal = function() {
			$rootScope.visible_company = $rootScope.visible_company ? false : true;
			$rootScope.errName = false;
			$rootScope.companyName = "";
			$rootScope.company_err_msg = "";
			if ($rootScope.visible_company) {
				body.addClass("overflowHidden");
				$rootScope.modal_class = "modal-backdrop fade in";
			} else {
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
			}
		};*/
		var showCompanyModal = function() {
			$rootScope.visible_company = $rootScope.visible_company ? false : true;
			$rootScope.errName = false;
			$rootScope.companyName = "";
			$rootScope.company_err_msg = "";
			if ($rootScope.visible_company) {
				body.addClass("overflowHidden");
				$rootScope.modal_class = "modal-backdrop fade in";
			} else {
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
			}
		};
		
		$rootScope.close = function(value,id) {
			if(value == "help"){
				$rootScope.visible_help = $rootScope.visible_help ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
			}
			else if(value == "company_cancel"){
				$rootScope.visible_company = $rootScope.visible_company ? false : true;
				body.removeClass("overflowHidden");
				$rootScope.modal_class = "";
			}
			else if(value == "company_ok"){
					var cname = "";
					$rootScope.errName = false;
					cname = $rootScope.companyName;
					if(cname == undefined || cname.trim().length <= 0){
						$rootScope.errName = true;
						return;
					}else{
						$rootScope.errName = false;
						$http({
							method : "POST",
							url : "/createCompany",
							data : {cname : cname.trim()},
							headers : {"Content-Type" : "application/json"}
						}).success(function(data){
							if(data.success == 1){
								var result_data = {companyCreator: data.creator, companyName: cname.trim(), id: data.row_id, projects: []};
								if ($rootScope.companies == null) {
									$rootScope.companies = [];
								}
								$rootScope.companies.push(result_data);
								$rootScope.visible_company = $rootScope.visible_company ? false : true;
								body.removeClass("overflowHidden");
								$rootScope.modal_class = "";
							}
							else if(data.success == 0){
								$rootScope.company_err_msg = "Internal Error!";
							}
							else if(data.success == 2){
								$rootScope.company_err_msg = data.err_desc;
							}
						});
				    }
			}
                
			else if(value == "companyNameEditcancel"){
                     
                     $rootScope.visibleEditCompanyName = $rootScope.visibleEditCompanyName ? false : true;
			         body.removeClass("overflowHidden");
				     $rootScope.modal_class = "";
			}
			else if(value == "companyNameEditok"){
                     $rootScope.visibleEditCompanyName = $rootScope.visibleEditCompanyName ? false : true;
                            body.removeClass("overflowHidden");
				            $rootScope.modal_class = "";
                            $http({
							  method : "POST",
							  url : "/EditCompany",
					 	      data : {id: $scope.companyId,companyName:$rootScope.companyName},
						 	  headers : {"Content-Type" : "application/json"}
						    }) 
                            .success(function(data){



						})
			}

			else if(value == "DeleteCompanyNameCancel"){
                     $rootScope.visibleDeleteCompanyName = $rootScope.visibleDeleteCompanyName ? false : true;
			           body.removeClass("overflowHidden");
				       $rootScope.modal_class = ""
			}

			else if(value == "deleteCompanyNameOkButton"){
                     $rootScope.visibleDeleteCompanyName = $rootScope.visibleDeleteCompanyName ? false : true;
                             body.removeClass("overflowHidden");
				            $rootScope.modal_class = ""

                            console.log($rootScope.companyName);
      //                       $http({
						// 	  method : "POST",
						// 	  url : "/EditCompany",
					 // 	      data : {id: $scope.companyId,companyName:$rootScope.companyName},
						//  	  headers : {"Content-Type" : "application/json"}
						//     }) 
      //                       .success(function(data){



						// })
			}

		};

		$rootScope.showCompanyPopup = function(value,id,companyName) {
          if(value == "EditCompany"){
          	$rootScope.modal_class = "modal-backdrop fade in";
                $rootScope.visibleEditCompanyName = $rootScope.visibleEditCompanyName ? false : true;
                    $scope.companyId=id;
                    $rootScope.companyName=companyName;
                   console.log(companyName)
              }
              
              else if(value=="DeleteCompany"){
              	$rootScope.modal_class = "modal-backdrop fade in";
                  $rootScope.visibleDeleteCompanyName = $rootScope.visibleDeleteCompanyName ? false : true;
                    $scope.companyId=id;
                    $rootScope.companyName=companyName;
                   console.log(companyName)

              }
}
		/*$timeout(function() {
		    $scope.createStyle={display:'none'};
		    $scope.mfaStyle={display:'non
		    e'};
		}, 5000);*/

	

});