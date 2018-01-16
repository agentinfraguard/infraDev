angular.module("scrollEffectDirective", []).directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             if (this.pageYOffset >= 1) {
                 element.addClass('resMenu');
             } else {
                 element.removeClass('resMenu');
                   
             }
        });
    };
});

