angular.module("processListController", ['ui.bootstrap']).controller("processListController", 
function($scope, $http, $rootScope, companyService, $window) {
	var ip = companyService.getId();
    if(ip==undefined){
 		ip = $window.localStorage.getItem('serverIp');
 	}
 	$window.localStorage.setItem('serverIp', ip);
    companyService.setId(null);

$rootScope.close = function(value) {

      		/*$http({
				url: "/refreshProcessListData",
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
			   });*/
    	


}
  var ProcessListPgeLoadDetail= function() {
	  	          $scope.totalItems ="";
                  $scope.maxSize = ""; 
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
	ProcessListPgeLoadDetail()

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