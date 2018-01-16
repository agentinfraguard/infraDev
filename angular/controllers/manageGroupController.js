angular.module("manageGroupController", []).controller("manageGroupController", 
	function($scope, $http, $rootScope, companyService, $window, $state, $document) {


		$scope.success ='success';
		$rootScope.editCreateGroup = 'Create Group';
		$rootScope.createEditType = 'Create Group';
        $rootScope.visibleDeleteUserData=false;
		$scope.groupsData = [];
		$rootScope.visible = false;
	    $rootScope.listOfUser_visible = false;
	    var body = angular.element($document[0].body);
	    var indexValue="";
		var local_index = -1;


		$scope.showOptions = function(index,$event) {
			if(local_index != index){
				$rootScope.visible = false;
			}
			local_index = index;
			$rootScope.visible = $scope.visible ? false : true;
			$event.stopPropagation();
		};

		$rootScope.addFunction = function() {
			console.log(" Add new User to group ");
			$window.localStorage.setItem('editGroupData', '');
			$state.go('iam.createGroup');
		}

		var getGroupsData = function() {
			var accountId = $window.localStorage.getItem('currentAccount');
			var userId = $window.localStorage.getItem('loggedInUser');
			$http({
				method : "post",
				url : "/getManageGroupsData",
				headers : {"Content-Type" : "application/json"},
				data : {accountId : accountId,userId : userId}
			})
			.success(function(data) {

				console.log(" data = "+JSON.stringify(data)+"   data length = "+data.length);
				var grouphasroles = data.grouphasroles;
				var grouphasusers = data.grouphasusers;
				for (var x in grouphasroles){
					putRolesIntoArray(grouphasroles[x].groupName,grouphasroles[x].roleName,grouphasroles[x].groupId,grouphasroles[x].roleId);
				}
				console.log(" groupsData = : "+JSON.stringify($scope.groupsData ));
				for (var x in grouphasusers){
					putUsersIntoArray(grouphasusers[x].groupName,grouphasusers[x].uname,grouphasusers[x].email,grouphasusers[x].userId);
				}
				console.log(" groupsData = : "+JSON.stringify($scope.groupsData ));
			});
		};

		getGroupsData();

		function putRolesIntoArray(groupName,roleName,groupId,roleId){
			console.log("putRolesIntoArray");
			var array = eval( $scope.groupsData );
			console.log("array = : "+array);
			for (var i = 0; i < array.length; i++ ){
				if(array[i].groupName === groupName){
					array[i].roleName = array[i].roleName +" , "+ roleName;
					array[i].roleIds = array[i].roleIds +","+ roleId;
					return;
				}
			}
			array.push({'groupName':groupName,'roleName':roleName,'groupId':groupId,'roleIds':roleId.toString()});
		}

		function putUsersIntoArray(groupName,userName,userEmail,userId){
			console.log("putUsersIntoArray");
			var array = eval( $scope.groupsData );
			for (var i = 0; i < array.length; i++ ){
				console.log(" count = "+array[i].count+" userdata = "+array[i].userdata);
				if(array[i].groupName === groupName){
					if(array[i].count == undefined){
						array[i].count = 1;
						array[i].userdata = userName+"("+userEmail+")";
						array[i].userIds = userId.toString();
					}else{
						array[i].count = array[i].count + 1;
						array[i].userdata = array[i].userdata+","+userName+"("+userEmail+")";
						array[i].userIds = array[i].userIds+","+userId;
					}
		}/*else{
			array[i].count = 0;
			array[i].userdata = null;
		}*/
	}
}

function deleteGroup(indexValue) {
	var accountId = $window.localStorage.getItem('currentAccount');
	var userId = $window.localStorage.getItem('loggedInUser');
	var groupId = $scope.groupsData[indexValue].groupId;
	console.log("accountId = : "+accountId+" userId = : "+userId+"  groupId = : "+groupId);
	$http({
		method : "post",
		url : "/deleteGroup",
		headers : {"Content-Type" : "application/json"},
		data : {accountId:accountId, userId:userId, groupId:groupId}
	})
	.success(function(data) {
		if(data.success==1){
			$scope.groupsData.splice( index, 1 );
			$scope.selectedIndex = -1;
			$rootScope.createEditDeleteGroupStatus = " The group has been deleted. "
		}else{
			$rootScope.createEditDeleteGroupStatus = " Something went wrong.Please try again !"
		}
	});
};

$rootScope.openPopUp = function(value,index) {
	if(value=="DeleteGroup"){
    $rootScope.deleteRoleName=" Delete Group ";
	$rootScope.deleteValue="Group";
	$rootScope.visibleDeleteUserData = $rootScope.visibleDeleteUserData ? false : true;
	$('.afterloginBody').addClass("overflowHidden");
    $rootScope.modal_class = "modal-backdrop fade in";
	indexValue=index;

	}
	else if (value=="Delete"){
     $rootScope.visibleDeleteUserData = $rootScope.visibleDeleteUserData ? false : true;
     $('.afterloginBody').removeClass("overflowHidden");
	 $rootScope.modal_class = "";
       deleteGroup(indexValue);
       console.log("Delete")

	}

 };
$rootScope.close = function() {
   $rootScope.visibleDeleteUserData = $rootScope.visibleDeleteUserData ? false : true;
   $('.afterloginBody').removeClass("overflowHidden");
   $rootScope.modal_class = "";
  
}

$scope.editGroup = function(index) {
	console.log(" editGroup ");
	var editGroupData = {
		groupName : $scope.groupsData[index].groupName,
		groupId : $scope.groupsData[index].groupId,
		rolenames : $scope.groupsData[index].roleName,
		roleids : $scope.groupsData[index].roleIds,
		usernames : $scope.groupsData[index].userdata,
		userids : $scope.groupsData[index].userIds
	};
	$window.localStorage.setItem('editGroupData', JSON.stringify(editGroupData));
	$rootScope.createEditType = 'Edit Group';
	var groupId = $scope.groupsData[index].groupId;
	var rolenames = $scope.groupsData[index].roleName;
	var roleids = $scope.groupsData[index].roleIds;
	var usernames = $scope.groupsData[index].userdata;
	var userids = $scope.groupsData[index].userIds;
	console.log("groupId = : "+groupId+"  rolenames = : "+rolenames+"  roleids = : "+roleids+"  usernames = : "+usernames+"   userids = : "+userids);
	$state.go('iam.createGroup');
};

$rootScope.open = function(value,index) {
	if(value=="listOfUser"){
          $rootScope.listOfUser_visible = $rootScope.listOfUser_visible ? false : true;
          $('.afterloginBody').addClass("overflowHidden");
		  $rootScope.modal_class = "modal-backdrop fade in";
          var rowData = $scope.groupsData[index];
          console.log("   rowData = : "+JSON.stringify(rowData));
          // console.log(" user count = : "+rowData.count);
          // console.log(" users = : "+rowData.userdata);
          // console.log(" groupName = : "+rowData.groupName);
           $rootScope.groupName=rowData.groupName;
           $rootScope.countUserdata=rowData.count;
                  var userdataSplit=$scope.groupsData[index].userdata;
                  // console.log(rowData.userdata+"userdata"+userdataSplit)
                  var arrMain=[];
                    userdataSplit=userdataSplit.split(",")
                     var userdataObjLength= Object.keys(userdataSplit).length
                    for(var i=0;i<userdataObjLength;i++){
                    	var userDataSplitValue=userdataSplit[i];
                    	 userDataSplitValue=String(userDataSplitValue);
                    	 userDataSplitValue=userDataSplitValue.replace(")"," ");
                    	 userDataSplitValue=String(userDataSplitValue);
                    	 userDataSplitValue=userDataSplitValue.split("(");
                    	 arrMain.push(userDataSplitValue)
                    	
                    }
                    $rootScope.userdataValue=arrMain;


	}
	else if (value="listOfUser_cancel") {
		          $rootScope.listOfUser_visible = $rootScope.listOfUser_visible ? false : true;
		         $('.afterloginBody').removeClass("overflowHidden");
				 $rootScope.modal_class = "";



	}


}
});