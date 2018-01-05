var db = require(process.cwd() + "/config/db");
var con = null;
module.exports = function(app){

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

app.post("/modifyRole", function(req, res){
	var roleName = req.body.roleName;
    var policies = req.body.policies;
    var accountId = req.body.accountId;
    var userId = req.body.userId;
    var roleId = req.body.roleId;
    console.log(" ModifyRole roleName = : "+roleName+"   policies = : "+policies+"    accountId = : "+accountId+"    userId = : "+userId+"     roleId = : "+roleId);
    if(con == null)
	con = db.openCon(con);
    Promise.all([
		new Promise((resolve, reject) => {
			con.query("update roles set policy = ?, roleName = ? where roleId = ?", [policies,roleName,roleId], function(err, result){
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

app.post("/deleteRole", function(req,res){
    var accountId = req.body.accountId;
    var userId = req.body.userId;
    var roleId = req.body.roleId;
    if(con == null)
	con = db.openCon(con);
    Promise.all([
		new Promise((resolve, reject) => {
			con.query("DELETE FROM roles WHERE (roleId = ? )", [roleId], function(err, result){
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
		res.status(200).json({success: 1});
	});
});

app.post("/getManageGroupsData", function(req,res){
    var accountId = req.body.accountId;
    var userId = req.body.userId;
    var data = {};
    if(con == null)
	con = db.openCon(con);
    Promise.all([
    	// get all roles associated with groups for this account
		new Promise((resolve, reject) => {
			con.query("select g.groupId,g.groupName,g.accountId,r.roleId,r.roleName,r.accountId from infradb.groups g "+
					  "inner join infradb.grouphasroles ghr "+
					  "on g.groupId = ghr.groupId "+
					  "inner join infradb.roles r "+
					  "on ghr.roleId = r.roleId "+
					  "where (g.accountId = ? or g.accountId = ?)", [0,accountId], function(err, result){
				if(err){
					console.log(err.stack);
					resolve(null);
					res.status(200).json({success: 0});
				}
				resolve(result);
			});
		}),
		// get all users associated with groups for this account
		new Promise((resolve, reject) => {
			con.query("select * from infradb.groups g "+
					  "inner join infradb.grouphasusers ghu "+
					  "on g.groupId = ghu.groupId and ghu.accountId = ? "+
					  "inner join infradb.users u "+
					  "on ghu.userId = u.id "+
					  "where (g.accountId = ? or g.accountId = ?)", [accountId,0,accountId], function(err, result){
				if(err){
					console.log(err.stack);
					resolve(null);
					res.status(200).json({success: 0});
				}
				resolve(result);
			});
		})
	]).then((results) => {
		data.grouphasroles = results[0];
		data.grouphasusers = results[1];
		console.log(" grouphasroles = : "+results[0]);
		console.log(" grouphasusers = : "+results[1]);
		res.status(200).json(data);
	});
});

app.post("/deleteGroup", function(req,res){
    var accountId = req.body.accountId;
    var userId = req.body.userId;
    var groupId = req.body.groupId;
    console.log("accountId = : "+accountId+" userId = : "+userId+"  groupId = : "+groupId);
    if(groupId != 1 || groupId !=2){
	    if(con == null)
		con = db.openCon(con);
	    Promise.all([
			new Promise((resolve, reject) => {
				con.query("DELETE FROM groups WHERE groupId = ? and accountId = ?", [groupId,accountId], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
						res.status(200).json({success: 0});
					}
					resolve(result);
				});
			}),
			new Promise((resolve, reject) => {
				con.query("DELETE FROM grouphasusers WHERE groupId = ? and accountId = ?", [groupId,accountId], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
						res.status(200).json({success: 0});
					}
					resolve(result);
				});
			}),
			new Promise((resolve, reject) => {
				con.query("DELETE FROM grouphasroles WHERE groupId = ?", [groupId], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
						res.status(200).json({success: 0});
					}
					resolve(result);
				});
			})
		]).then((results) => {
			console.log(" groups Data = : "+results[0]);
			res.status(200).json({success: 1});
		});
	}else{
		res.status(200).json({success: 0});
	}
});

app.post("/getManageUsersData", function(req,res){
    var accountId = req.body.accountId;
    var userId = req.body.userId;
    if(con == null)
	con = db.openCon(con);
    Promise.all([
    	// get all users for this account
		new Promise((resolve, reject) => {
			con.query("select * from infradb.userhasaccount uha "+
					  "inner join infradb.users u "+
					  "on uha.userId = u.id "+
					  "inner join infradb.grouphasusers ghu "+
					  "on uha.userId = ghu.userId and ghu.accountId = uha.accountId "+
					  "inner join infradb.groups g "+
					  "on g.groupId  = ghu.groupId "+
					  "where uha.accountId = ?", [accountId], function(err, result){
				if(err){
					console.log(err.stack);
					resolve(null);
					res.status(200).json({success: 0});
				}
				resolve(result);
			});
		})
	]).then((results) => {
		console.log(" Manage Users Data = : "+JSON.stringify(results[0]));
		res.status(200).json(results[0]);
	});
});

app.post("/deleteUser", function(req,res){
    var accountId = req.body.accountId;
    var userId = req.body.userId;
    console.log("accountId = : "+accountId+" userId = : "+userId);
    if(con == null)
	con = db.openCon(con);
    Promise.all([
		new Promise((resolve, reject) => {
			con.query("DELETE FROM userhasaccount WHERE userId = ? and accountId = ?", [userId,accountId], function(err, result){
				if(err){
					console.log(err.stack);
					resolve(null);
					res.status(200).json({success: 0});
				}
				resolve(result);
			});
		}),
		new Promise((resolve, reject) => {
			con.query("DELETE FROM grouphasusers WHERE userId = ? and accountId = ?", [userId,accountId], function(err, result){
				if(err){
					console.log(err.stack);
					resolve(null);
					res.status(200).json({success: 0});
				}
				resolve(result);
			});
		})
	]).then((results) => {
		console.log(" users Data = : "+results[0]);
		res.status(200).json({success: 1});
	});
});

app.post("/getUsersandGroupsInAnAccount", function(req,res){
    var accountId = req.body.accountId;
    var userId = req.body.userId;
    var data = {};
    if(con == null)
	con = db.openCon(con);
    Promise.all([
    	// get all users for this account
		new Promise((resolve, reject) => {
			con.query("select * from infradb.userhasaccount uha "+
					  "inner join infradb.users u "+
					  "on uha.userId = u.id "+
					  "where uha.accountId = ?", [accountId], function(err, result){
				if(err){
					console.log(err.stack);
					resolve(null);
					res.status(200).json({success: 0});
				}
				resolve(result);
			});
		}),
		// get all groups for this account
		new Promise((resolve, reject) => {
			con.query("select * from infradb.roles where accountId = ? or accountId = ?", [0,accountId], function(err, result){
					if(err){
					console.log(err.stack);
					resolve(null);
					res.status(200).json({success: 0});
				}
				resolve(result);
			});
		})
	]).then((results) => {
		console.log(" Account Users Data = : "+JSON.stringify(results[0]));
		data.userList = results[0];
		data.roleList = results[1];
		res.status(200).json(data);
	});
});

app.post("/createNewGroup", function(req, res){

	var groupName = req.body.groupName;
    var accountId = req.body.accountId;
    var users = req.body.users;
    var roles = req.body.roles;
    console.log(" accountId = : "+accountId+"   groupName = : "+groupName+"   users = : "+users+"    roles = : "+roles);
    
    if(con == null)
	con = db.openCon(con);
    con.beginTransaction(function(err) {
	    if (err) { console.log(err.stack); }
        var data = {
					groupName : groupName,
					accountId : accountId
					};
        con.query("insert into groups set ? ", data, function(err, result){
			if(err){
				return con.rollback(function() {
                    console.log(err.stack);
                    res.json({success : "error"});
                });
			}
			var groupId = result.insertId;
			var grouphasroles = [];
			for(var i=0;i<roles.length;i++){
				record = [groupId,roles[i]];	
				grouphasroles.push(record);
			}
			console.log(" grouphasroles  = : "+grouphasroles);
			con.query("insert into grouphasroles (groupId,roleId) values ?", [grouphasroles], function(err, result1){
				if(err){
				  return con.rollback(function() {
                      console.log(err.stack);
                      res.json({success : "error"});
                    });
				}
				if(users.length>0){
					var grouphasusers = [];
					for(var i=0;i<users.length;i++){
						record = [groupId,users[i],accountId];	
						grouphasusers.push(record);
					}
					console.log(" grouphasusers  = : "+grouphasusers);
					con.query("insert into grouphasusers (groupId,userId,accountId) values ?", [grouphasusers], function(err, result1){
						if(err){
						  return con.rollback(function() {
		                      console.log(err.stack);
		                      res.json({success : "error"});
	                        });
						}
					});
				}
				con.commit(function(err) {
			        if (err) {
			            return con.rollback(function() {
			                console.log(err.stack);
			            });
			        }
			        console.log(" New group Created ");
				    res.json({success : 1});
			    });
			});
        });
	});
});

}