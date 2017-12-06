angular.module("dashBoard", ["ngRoute","profileController", "HelpController",
"companyDetailController","projectDetailController","createProjectController","fileUploadDirective",
"companyService","serverController","manageUsersController","mfaPageController","manageRolesController","createRoleController"]).config(
function($routeProvider){ 
    
    $routeProvider
    .when("/", {
        templateUrl : "pages/companyDetails.html",
        controller : "profileController"
    })
    .when("/project", {
        templateUrl : "pages/projectDetails.html",
        controller : "companyDetailController"
    })
    .when("/server", {
        templateUrl : "pages/serverDetails.html",
        controller : "serverController"
    })
    .when("/profile", {
        templateUrl : "pages/userProfile.html",
        controller : "profileController"
    })
    .when("/mfa", {
        templateUrl : "pages/mfaPage.html",
        controller : "mfaPageController"
    })
    .when("/users", {
        templateUrl : "pages/manageUsers.html",
        controller : "manageUsersController"
    })
    .when("/createrole", {
        templateUrl : "pages/createrole.html",
        controller : "createRoleController"
    })
    .when("/manageRole", {
        templateUrl : "pages/manageroles.html",
        controller : "manageRolesController"
    })
    .when("/eachServer", {
        templateUrl : "pages/eachServerDetail.html",
        controller : "eachServerDetailController"
    })
    .when("/manageGroup", {
        templateUrl : "pages/manageGroup.html",
        //controller : ""
    })
    .when("/createGroup", {
        templateUrl : "pages/createNewGroup.html",
        //controller : ""
    })
    .when("/manageUsers", {
        templateUrl : "pages/manageUsers.html",
        //controller : ""
    })
    .when("/inviteUsers", {
        templateUrl : "pages/inviteUser.html",
        //controller : ""
    })
    .otherwise({
        redirectTo : "/"
    });
});