angular.module("managePopUpDirective", []).directive('serverDirective', [ '$rootScope', function($rootScope,$window) {
  $rootScope.menuIcon=false;
    return {
        restrict: 'A',
        require : "ngModel",
        link : function(scope, elem, attrs, ctrl){
            if(attrs.name == "hideShowModel"){
                elem.on('click', function() {
                if(scope.visible==true){
                   $rootScope.visible = false ; 
                }
                if($rootScope.listStatus == true){
                   $rootScope.listStatus = false;
                }
                if ($rootScope.menuIcon==true) {
                    $rootScope.myClass.pop('responsiveMenu');  
                }
                scope.$apply();
               })
            }
        }
    };
}]);