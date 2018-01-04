angular.module("dashBoard", ["ui.router","multipleSelect","profileController", "HelpController","companyDetailController",
"projectDetailController","createProjectController","fileUploadDirective","companyService","serverController",
"manageUsersController","mfaPageController","manageRolesController","createRoleController","manageGroupController",
"createGroupController","manageUsersController","inviteUsersController","eachServerDetailController"])
.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('dashboard', {
      url: '/',
      templateUrl: 'pages/companyDetails.html',
      controller: 'profileController'
    })
    .state('project', {
      url: '/project',
      templateUrl: 'pages/projectDetails.html',
      controller: 'companyDetailController'
    })
    .state('server', {
      url: '/server',
      templateUrl: 'pages/serverDetails.html',
      controller: 'serverController'
    })
    .state('eachServer', {
      url: '/eachServer',
      templateUrl: 'pages/eachServerDetail.html',
      controller: 'eachServerDetailController'
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'pages/userProfile.html',
      controller: 'profileController'
    })
    .state('mfa', {
      url: '/mfa',
      templateUrl: 'pages/mfaPage.html',
      controller: 'mfaPageController'
    })
    .state('iam', {
      url: '/iam',
      abstract: true,
      templateUrl: 'pages/iammanagement.html',
    })
    .state('iam.manageroles', {
      url: '',
      templateUrl: 'pages/manageroles.html',
      controller: 'manageRolesController'
    })
    .state('iam.createEditRole', {
      url: '/createEditRole',
      templateUrl: 'pages/createrole.html',
      controller: 'createRoleController'
    })
    .state('iam.manageGroup', {
      url: '/manageGroup',
      templateUrl: 'pages/manageGroup.html',
      controller: 'manageGroupController'
    })
    .state('iam.createGroup', {
      url: '/createGroup',
      templateUrl: 'pages/createNewGroup.html',
      controller: 'createGroupController'
    })
    .state('iam.manageUsers', {
      url: '/manageUsers',
      templateUrl: 'pages/manageUsers.html',
      controller: 'manageUsersController'
    })
    .state('iam.inviteUsers', {
      url: '/inviteUsers',
      templateUrl: 'pages/inviteUser.html',
      controller: 'inviteUsersController'
    })
    $urlRouterProvider.otherwise('/');

});