var db = require(process.cwd() + "/config/db");
var con = null;
module.exports = function(app){

app.post("/createNewRole", function(req, res){
	var roleName = req.body.roleName;
    var policies = req.body.policies;
    var accountId = req.body.accountId;
    var userId = req.body.userId;
    console.log(" roleName = : "+roleName+"   policies = : "+policies+"    accountId = : "+accountId+"    userId = : "+userId);
    var roleData = {
        	            roleName : req.body.roleName,
        	            policy : req.body.policies,
        	            accountId : req.body.accountId,
        	            roleCreator : req.body.userId,
        	            type : "user-defined"
                    };
    if(con == null)
	con = db.openCon(con);
    Promise.all([
	new Promise((resolve, reject) => {
	con.query("insert into roles set ?", [roleData], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
			res.status(200).json({success: 0});
		}
		resolve(result);
	});
	})
	]).then((results) => {
		res.status(200).json({success: 1});

	});
});

app.post("/getManageRolesData", function(req,res){
    var accountId = req.body.accountId;
    var userId = req.body.userId;
    if(con == null)
	con = db.openCon(con);
    Promise.all([
	new Promise((resolve, reject) => {
		con.query("SELECT * FROM roles WHERE (accountId = ? or accountId = ? )", [0,accountId], function(err, result){
			if(err){
				console.log(err.stack);
				resolve(null);
				res.status(200).json({success: 0});
			}
			resolve(result);
		});
		})
	]).then((results) => {
		console.log(" roles Data = : "+results[0]);
		res.status(200).json({success: 1,roleData : results[0]});
	});

});

}