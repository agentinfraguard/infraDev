angular.module("myApp", ["ui.router", "loginController", "signupController", "homeController", 
"passwValidation","resetpwdController"]).config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
	.state('homePage', {
      url: '/',
      templateUrl: 'pages/homePageContent.html',
      controller: 'homeController'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'pages/login.html',
      controller: 'loginCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'pages/register.html',
      controller: 'signupCtrl'
    })
    .state('resetPassword', {
      url: '/resetPassword',
      templateUrl: 'pages/resetPwdPage.html',
      controller: 'resetpwdController'
    })
    $urlRouterProvider.otherwise('/');
    
});
