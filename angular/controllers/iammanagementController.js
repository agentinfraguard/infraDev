angular.module("iammanagementController", []).controller("iammanagementController", 
function($scope, $http, $rootScope, companyService, $window, $state) {
 $rootScope.menuIconDiv=true;
  $rootScope.menuIcon=true;
 
console.log("iammanagementController");
    $rootScope.myClass = [];
    $rootScope.addClass = function() {

      if($rootScope.myClass.indexOf("responsiveMenu") < 0){
      	$rootScope.myClass.push('responsiveMenu');
      		 $rootScope.menuIcon=true;
      }
      else{
      	$rootScope.myClass.pop('responsiveMenu');
      	$rootScope.menuIcon=false;	
      }
      
}




   
    
});