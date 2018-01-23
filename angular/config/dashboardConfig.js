angular.module("dashBoard", ["ui.router","multipleSelect","profileController", "HelpController","companyDetailController",
"projectDetailController","createProjectController","fileUploadDirective","companyService","serverController",
"manageUsersController","mfaPageController","manageRolesController","createRoleController","manageGroupController",
"createGroupController","manageUsersController","inviteUsersController", 
"userListController", "processListController", "auditLoginController", "getAccessKeyController", "runScriptController", "serverTerminalController","eachServerDetailController","managePopUpDirective",
"lockDownServerController", "envListController","iammanagementController","scrollEffectDirective","resetpwdController"])
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
      controller:'iammanagementController'
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
    .state('eachServer', {
      url: '/eachServer',
      abstract: true,
      templateUrl: 'pages/eachServerDetail.html',
      controller: "eachServerDetailController"
    })
    .state('eachServer.userList', {
      url: '',
      templateUrl: 'pages/userList.html',
      controller: 'userListController'
    })
    .state('eachServer.processList', {
      url: '/processList',
      templateUrl: 'pages/processList.html',
      controller: 'processListController'
    })
    .state('eachServer.auditLogin', {
      url: '/auditLogin',
      templateUrl: 'pages/auditLogin.html',
      controller: 'auditLoginController'
    })
    .state('eachServer.getAccessKey', {
      url: '/getAccessKey',
      templateUrl: 'pages/getAccessKey.html',
      controller: 'getAccessKeyController'
    })
    .state("eachServer.runScript", {
      url: "/runScript",
      templateUrl: "pages/runScript.html",
      controller: "runScriptController"
    })
    .state("eachServer.serverTerminal", {
      url: "/serverTerminal",
      templateUrl: "pages/serverTerminal.html",
      controller: "serverTerminalController"
    })
    .state("eachServer.lockDownServer", {
      url: "/lockDownServer",
      templateUrl: "pages/lockDownServer.html",
      controller: "lockDownServerController"
    })
    .state("eachServer.envList", {
      url: "/envList",
      templateUrl: "pages/envList.html",
      controller: "envListController"
    })
     .state('resetPassword', {
      url: '/updatePassword',
      templateUrl: 'pages/resetPwdPage.html',
      controller: 'resetpwdController'
    })
    $urlRouterProvider.otherwise('/');

});