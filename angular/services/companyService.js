angular.module("companyService", []).service("companyService", function(){
var id = "";
var name="";
this.getId = function(){
return this.id;
};	
this.setId = function(id) {
this.id = id;
};

this.getName = function(){
return this.name;
};	
this.setName = function(name) {
this.name = name;
};

});