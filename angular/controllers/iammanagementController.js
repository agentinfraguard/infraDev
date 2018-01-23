angular.module("iammanagementController", []).controller("iammanagementController", 
function($scope, $http, $rootScope, companyService, $window, $state) {
 $rootScope.menuIconDiv=true;
  $rootScope.menuIcon=true;
 
console.log("iammanagementController");
    $rootScope.myClass = [];
    $rootScope.my_Class = [];

    $rootScope.addClass = function() {

      if($rootScope.myClass.indexOf("responsiveMenu") < 0){
      	   $rootScope.myClass.push('responsiveMenu');
           $rootScope.my_Class.push('leftSlideMenu');
      		 $rootScope.menuIcon=true;
      }
      else{
      	 $rootScope.myClass.pop('responsiveMenu');
         $rootScope.my_Class.pop('leftSlideMenu');
      	 $rootScope.menuIcon=false;	
      }
      
}

    if($rootScope.myClass.indexOf("responsiveMenu") < 0){
           $rootScope.my_Class.push('leftSlideMenu');
      }
      else{
         $rootScope.my_Class.pop('leftSlideMenu');
      }



   
    
});