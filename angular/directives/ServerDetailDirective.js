angular.module("ServerDetailDirective", []).directive('serverDirective', [ '$rootScope', function($rootScope) {
  
    return {
        restrict: 'A',
        require : "ngModel",
        link : function(scope, elem, attrs, ctrl){
            if(attrs.name == "hideShowModel"){
                elem.on('click', function() {
                 if(scope.visible==true){
                    $rootScope.visible = false ;    
                 }
                 scope.$apply()
                
               })

             }     
        }
    };
}]);