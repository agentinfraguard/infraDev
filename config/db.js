var mysql = require("mysql");

var config = require(process.cwd() + "/configuration.json");
console.log("username = : "+config.user +"     password = : "+config.password);
module.exports = {

openCon : function(con){
	con = mysql.createConnection({
		host: config.host,
		user: config.user,
		password: config.password,
		database: config.database,
		port:config.port
	});
	con.connect(function(err){
		if(err){
		console.log("connection problem: ", err.stack);
		return null;
		}
		console.log(" DB connection successful !");
	});
 return con;
},

closeCon : function(con){
	if(con != null){
		con.end(function(err){
			if(err) console.log(err.stack);
		});
	}
}


};
