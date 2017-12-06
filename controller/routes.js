var bodyParser = require("body-parser");
var multer = require("multer");
var bcryptPassw = require(process.cwd() + "/util/bcryptPassword");
var db = require(process.cwd() + "/config/db");
var urlencoded = bodyParser.urlencoded({extended: true});
var speakeasy = require('speakeasy');// for MFA 
var QRCode = require('qrcode');
var keypair = require('keypair');
var forge = require('node-forge');
var cron = require('node-cron');
var pair = keypair();
var con = null;
var storage = multer.diskStorage({
  destination: './angular/images/profileImages/',
  filename: function (req, file, cb) {
  			var imageName = req.session.email + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
            cb(null, imageName);
        }
});
var upload = multer({ storage: storage }).single("file");

// cron schedule for auto rotating server keys 1st day of every month
cron.schedule('0 0 1 * *', function(){
	if(con == null)
	con = db.openCon(con);
	con.query("SELECT distinct s.serverIP,u.email,s.id FROM users u INNER JOIN companydetails c ON u.id = c.companyCreator INNER JOIN projectdetails p ON c.id = p.company_id INNER JOIN servers s ON p.id = s.project_id WHERE autoKeyRotation = ?", [1], function(err, result){
		if(err)console.log(err.stack);
		if(result.length>0){
			updateServerKey(result);
		}
	});
});

// cron schedule to revoke server access for every active user daily cron.schedule('0 0 * * *', function(){
cron.schedule('0 0 * * *', function(){
  revokeServerAccess();
});

module.exports = function(app){
app.use(bodyParser.json());
app.get("/", function(request, response){

	if(request.session.email) {
	    response.sendFile(process.cwd() + "/angular/pages/dashBoard.html");
	    response.status(200);
	}
	else {
		response.sendFile(process.cwd() + "/angular/pages/homePage.html");
		response.status(200);
	}
});

app.get("/resetPassword", function(request, response){
 
    var data = new Buffer(request.query.data, 'base64').toString().split("&");
	var id = data[0].split("id=")[1];
	var time = data[1].split("timeStamp=")[1];
	var timeDiffHrs = (Date.now() - time)/(1000*60*60);

	if(timeDiffHrs >= 24) {
	    response.writeHead(200, {'Content-Type': 'text/plain'});
	    response.end('Hello ! Your link has expired. It is valid for 24 Hrs only. Please try again !\n');
	}
	else {
		// show the password reset page
		response.sendFile(process.cwd() + "/angular/pages/resetpwdPage.html");
		response.status(200);
	}
});

app.post("/updatePassword", urlencoded, function(req, res){
	var userId = req.body.userId;
	var passw = bcryptPassw.generateHash(req.body.pwd);
	
	if(con == null)
	con = db.openCon(con);
	con.query("update users set passw = ? where id = ?", [passw,userId], function(err, result) {
	if (err) {
		res.json({success : 0, err : err});
		return;
	}
	else if(result.affectedRows > 0){
        res.json({success : 1});
	}
	});
	
});

app.get("/logout", function(req, res){
	req.session.destroy(function(err) {
	  if(err) {
	    console.log(err);
	  } else {
	  	 res.redirect('/');
	  }
	});
});

app.post("/signupAction", urlencoded, function(req, res){
	var email = req.body.email;
	var uname = req.body.uname;
	var passw = bcryptPassw.generateHash(req.body.passw);
	var userRegistration = "self";
	var data = {
		email : email,
		uname : uname,
		passw : passw,
		userRegistration : userRegistration
	}
	signupAction(req, res, data);
});

app.post("/loginAction", urlencoded, function(req, res){
	var email = req.body.email;
	var passw = req.body.passw;
	var data = {
		email : email,
		passw : passw
	};
	loginAction(req, res, data);
});

app.post("/getUserData", function(req, res){
	getUserData(req, res);
});

app.post("/checkEmail", function(req, res) {
	var email = req.body.email;
	if(con == null)
	con = db.openCon(con);
	con.query("select * from users where email = ?", [email], function(err, result) {
		if (err) console.log("check_email.error: ", err.stack);
		if (result.length > 0) {
			res.json({found: 1,result : result[0]});
		} else {
			res.json({found : 0});
		}
	});
});

app.post("/uploadImage", function(req, res) {
	if(con == null)
	con = db.openCon(con);
	upload(req, res, function(err){
        if(err){
            res.json({success : 0, err_desc : err});
            return;
        }
        con.query("update users set userImage = ? where email = ?", [req.file.filename, req.session.email], function(err, result) {
        	if(err){
        		res.json({success : 0, err_desc : err});
             	return;
         	}
         	else if(result.affectedRows > 0){
         		res.json({success : 1, err_desc : null});
         	}
        });
	})
});

app.post("/updateSSHKey", function(req, res) {
	if(con == null)
	con = db.openCon(con);
	con.query("update users set ssh_key = ? where email = ?", [req.body.sshKey, req.session.email], function(err, result) {
		if (err) {
			res.json({success : 0, err_desc : err});
			return;
		}
		else if(result.affectedRows > 0){
		res.json({success : 1, err_desc : null});
		}
	});
});

app.post("/save_profile_info", function(req, res) {
if(con == null)
con = db.openCon(con);
	con.query("update users set shell = ?, linuxName = ? where email = ?", 
		[req.body.shell, req.body.linux_uname, req.session.email], 
		function(err, result){
			if(err){
				res.json({success : 0, err_desc : err});
				return;
			}
			else if(result.affectedRows > 0){
				res.json({success : 1, err_desc : null});
			}
	});
});

app.post("/createCompany", function(req, res){
if(con == null)
con = db.openCon(con);
var data = {
companyName : req.body.cname,
companyCreator : req.session.uid
};

con.query("select * from companydetails where companyCreator = ? and companyName = ?", [req.session.uid,req.body.cname], function(err, result){
	if(err){
		res.json({success : 2, err_desc : err});
		return;
	}
	else if(result.length > 0){
		res.json({success : 2, err_desc : "Company Already Exists!"});
		return;
	}
	else{
		con.query("insert into companydetails set ?", [data], function(err, result){
	if(err){
		res.json({success : 0, err_desc : err});
		return;
	}
	res.json({success : 1, err_desc : null, row_id: result.insertId, creator: req.session.uid});
	});
	}
	
	});
});

app.post("/createProject", function(req, res) {
if(con == null)
con = db.openCon();	
var data = {
projectName : req.body.pname,
company_id : req.body.cid
};

con.query("select * from projectdetails where projectName = ? and company_id = ?", [req.body.pname,req.body.cid], function(err, result){
	if(err){
		res.json({success : 0, err_desc : err});
		return;
	}
	else if(result.length > 0){
		res.json({success : 2, err_desc : "Project Already Exists!"});
		return;
	}
	else{
		con.query("insert into projectdetails set ?", [data], function(err, result) {
		if(err){
			console.log(err.stack);
			res.json({success: 0, err_desc: err});
		}
		else
			res.json({success: 1, err_desc: null, row_id: result.insertId});
	   });
	}
	
	});
});

app.post("/getProject", function(req, res) {
if(con == null)
	con = db.openCon(con);
var obj = {};
Promise.all([

	new Promise((resolve, reject) => {
		con.query("select * from projectdetails where id = ?", [req.body.id], function(err, result) {
			if(err)console.log(err.stack);
			if(result.length > 0){
				resolve(result[0]);
			}
			resolve(null);
		});
	})

]).then((results) => {
obj.project = results[0];
res.status(200).json(obj);
});
});

app.post("/getProjectPagedetails", function(req, res) {
if(con == null)	
	con = db.openCon(con);
var obj = {};
Promise.all([
	new Promise((resolve, reject) => {
		con.query("select * from companydetails where id = ? ", [req.body.id], function(err, result) {
			if(err)console.log(err.stack);
			if(result.length > 0){
				resolve(result[0]);
			}
			resolve(null);
		});
	}),
	new Promise((resolve, reject) => {
			con.query("SELECT * FROM projectdetails WHERE company_id = ? ", [req.body.id], function(err, result){
				if(err)console.log(err.stack);
					if(result.length > 0){
						resolve(result);
					}
					resolve(null);
					
				});
			
		}),
	new Promise((resolve, reject) => {
			con.query("SELECT * FROM projectdetails p INNER JOIN servers s ON p.id = s.project_id WHERE p.company_id = ? ", [req.body.id], function(err, result){
				if(err)console.log(err.stack);
				if(result.length > 0){
					resolve(result);
				}
				resolve(null);
			});
		})
	

])
.then((results) => {
	obj.company = results[0];
	obj.projects = results[1];
	obj.servers = results[2];
	res.status(200).json(obj);
});

});


app.post("/getServerPageDetails", function(req, res){
	if(con == null)
	con = db.openCon(con);
	var obj = {};
	Promise.all([
		new Promise((resolve, reject) => {
			con.query("select * from projectdetails where id = ? ", [req.body.id], function(err, result) {
				if(err)console.log(err.stack);
				if(result.length > 0){
					resolve(result[0]);
				}
				resolve(null);
			});
		}),
		new Promise((resolve, reject) => {
				con.query("SELECT * FROM servers WHERE project_id = ? ", [req.body.id], function(err, result){
					if(err)console.log(err.stack);
						if(result.length > 0){
							resolve(result);
						}
						resolve(null);
						
					});
				
			})
	])
	.then((results) => {
		obj.project = results[0];
		obj.servers = results[1];
		res.status(200).json(obj);
	});
});

app.get("/getProjectData", function(req, res){
if(con == null)
con = db.openCon(con);
var obj = {};
obj.projectdata = null;
obj.companydata = null;
Promise.all([
	
		new Promise((resolve, reject) => {
			con.query("SELECT * FROM companydetails WHERE companyCreator = ? ", [req.session.uid], function(err, result){
				if(err)console.log(err.stack);
				if(result.length > 0){
					resolve(result);
				}
				resolve(null);
				
			});

			
		}),

		new Promise((resolve, reject) => {
			con.query("SELECT * FROM companydetails c INNER JOIN projectdetails p ON c.id = p.company_id WHERE c.companyCreator = ? ", [req.session.uid], function(err, result){
				if(err)console.log(err.stack);
					if(result.length > 0){
						resolve(result);
					}
					resolve(null);
					
				});
			
		})
		
	]).then((results) => {
		obj.companydata = results[0];
		obj.projectdata = results[1];
		res.status(200).json(obj);
	});



});

app.post("/showUsers", function(req, res){
if(con == null)
con = db.openCon(con);
con.query("select * from users where email like ?", [req.body.email], function(err, result){
if(err)console.log(err.stack);
res.status(200).json(result);
});
});

app.post("/showUsersOnServer", function(req, res){
if(con == null)
con = db.openCon(con);
con.query("select * from servers where serverIP = ?", [req.body.serverIp], function(err, result){
if(err)console.log(err.stack);
res.status(200).json(result);
});
});

app.post("/showPrivilegeUsers", function(req, res){
if(con == null)
con = db.openCon(con);
con.query("select * from servers where serverIP = ?", [req.body.serverIp], function(err, result){
if(err)console.log(err.stack);
res.status(200).json(result);
});
});

app.post("/getUserRole", function(req, res){
if(con == null)
con = db.openCon(con);
con.query("select * from userRole where uname = ?", [req.body.uname], function(err, result){
if(err)console.log(err.stack);
if(result != null && result.length > 0){
res.status(200).json(result[0].role);
}else{
	var role = "user";
	res.status(200).json(role);
}
});
});

app.post("/getUserEmail", function(req, res){
if(con == null)
con = db.openCon(con);
con.query("select * from users where uname = ?", [req.body.uname], function(err, result){
if(err)console.log(err.stack);
if(result != null && result.length > 0){
res.status(200).json(result[0].email);
}else{
	res.status(200).json(null);
}
});
});

app.post("/addUserToServer", function(req, res){
if(con == null)
con = db.openCon(con);
var data = req.body;
var record = {};
if(data.search == 1){
record = {
	serverIp: data.serverIp,
	activityName: "addUser",
	requiredData: JSON.stringify({
		userName: data.user.uname,
		shell: data.user.shell
	}),
	status: "0"
};	
Promise.all([
new Promise((resolve, reject) => 
{
	con.query("insert into agentActivities set ?", [record], function(err, result){
		if(err)console.log(err.stack);
			resolve(result);
	});
})
]).then((results) => {
	res.status(200).json({success: 1});
});
}
else{
Promise.all([
new Promise((resolve, reject) => {
	con.query("select * from users where email = ?", [data.user.email], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}
		else if(result.length <= 0){
			data.user.passw = bcryptPassw.generateHash(data.user.passw);
			con.query("insert into users set ?", [data.user], function(err1, result1){
				if(err1){
					console.log(err1.stack);
					resolve(null);
				}
				resolve(null);
			});
		}
		else{
			resolve(0);
		}
		
	});
	
}),
new Promise((resolve, reject) => {
	con.query("select * from users where email = ?", [data.user.email], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}
		else if(result.length > 0){
			record = {
				serverIp: data.serverIp,
				activityName: "addUser",
				requiredData: JSON.stringify({
					userName: result[0].uname,
					shell: result[0].shell
					
				}),
				status: "0"
				};
		}
		else if(result.length <= 0){
			record = {
				serverIp: data.serverIp,
				activityName: "addUser",
				requiredData: JSON.stringify({
					userName: data.user.uname,
					shell: data.user.shell
					
				}),
				status: "0"
			};
		}
			con.query("insert into agentActivities set ?", [record], function(err1, result1){
				if(err1){
					console.log(err1.stack);
					resolve(null);
				}
				resolve(1);
			});
		
			resolve(0);
		
	});

})
]).then((results) => {
	res.status(200).json({success: 1});
});

}

});

app.post("/deleteUserFromServer", function(req, res){
if(con == null)
con = db.openCon(con);
var data = req.body;
var record = null;

if(data.search == 1){
record = {
	serverIp: data.serverIp,
	activityName: "deleteUser",
	requiredData: JSON.stringify({
		userName: data.uname
	}),
	status: "0"
};
Promise.all([
new Promise((resolve, reject) => {
	con.query("insert into agentActivities set ?", [record], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}
		resolve(result);
	});
})
]).then((results) => {
	res.status(200).json({success: 1});
});
}
else if(data.search == 2){
record = {
	serverIp: data.serverIp,
	activityName: "deleteUser",
	requiredData: JSON.stringify({
		userName: data.uname
	}),
	status: "0"
};
Promise.all([
new Promise((resolve, reject) => {

	con.query("select * from servers where serverIP = ?", [data.serverIp], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}
		else if(result.length > 0){
			var users = result[0].userList;
			if(users.indexOf(data.uname) < 0){
				resolve(0);
			}else{
			con.query("insert into agentActivities set ?", [record], function(err1, result1){
				if(err1){
					console.log(err1.stack);
					resolve(null);
				}
				resolve(1);
			});
			}
		}
		else{
			resolve(0);
		}
		
	});

})
]).then((results) => {
	res.status(200).json({success: results[0]});
});
}
else{
	res.status(200).json({success: 0});
}
});

app.post("/changeUserPrivilege", function(req, res){
if(con == null)
con = db.openCon(con);
var data = req.body;
var record = null;
record = {
	serverIp: data.serverIp,
	activityName: "changePrivilege",
	requiredData: JSON.stringify({
		userName: data.uname,
		privilege: data.userRole,
        email: data.userEmail
	}),
	status: "0"
};
Promise.all([
	new Promise((resolve, reject) => {
	con.query("insert into agentActivities set ?", [record], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}
		resolve(result);
	});
})
]).then((results) => {
	res.status(200).json({success: 1});
});
});

app.post("/lockDownServer", function(req, res){
if(con == null)
con = db.openCon(con);
var data = req.body;
var record = null;

Promise.all([
new Promise((resolve, reject) => {

	con.query("select userList from servers where serverIP = ?", [data.serverIp], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}
		else if(result.length > 0){
			var users = result[0].userList;
				record = {
				serverIp: data.serverIp,
				activityName: "lockDownServer",
				requiredData: JSON.stringify({
					userList: users
				}),
				status: "0"
			    };
			con.query("insert into agentActivities set ?", [record], function(err1, result1){
				if(err1){
					console.log(err1.stack);
					resolve(null);
				}
				resolve(1);
			});
		}
		else{
			resolve(0);
		}
	});
})
]).then((results) => {
	res.status(200).json({success: results[0]});
});
});

app.post("/unlockServer", function(req, res){
if(con == null)
con = db.openCon(con);
var data = req.body;
var record = null;

Promise.all([
new Promise((resolve, reject) => {

	con.query("select userList from servers where serverIP = ?", [data.serverIp], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}

		else if(result.length > 0){
			var users = result[0].userList;
				record = {
				serverIp: data.serverIp,
				activityName: "unlockServer",
				requiredData: JSON.stringify({
					userList: users
				}),
				status: "0"
			    };
			con.query("insert into agentActivities set ?", [record], function(err1, result1){
				if(err1){
					console.log(err1.stack);
					resolve(null);
				}
				resolve(1);
			});
		}
		else{
			resolve(0);
		}
	});
})
]).then((results) => {
	res.status(200).json({success: results[0]});
});
});

app.post("/mfaPageData", function(req, res){
if(con == null)
con = db.openCon(con);
var secret = null;
var qrcode = null;
if(req.session.uid != undefined){
	con.query("select * from users where id = ?", [req.session.uid], function(err, result){
		if(err){
			console.log(err.stack);
			res.json({success : 0});
		}
		if(result.length>0){
           if(result[0].mfaEnabled == 1){
           	 secret = JSON.parse(result[0].mfaSecret);
	           	QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
	             qrcode = data_url ;// get QR code data URL
	             res.json({mfaEnabled : 1,qrcode : qrcode,secret:secret,name:result[0].uname});
	            });
	        }
            else {
            	var name = result[0].uname+"@InfraGuardDashBoard"
               secret = speakeasy.generateSecret({length: 32,name:name,issuer:"InfraGuard"});
               QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
	             qrcode = data_url ;// get QR code data URL
	             res.json({mfaEnabled : 0,qrcode : qrcode,secret:secret,name:result[0].uname });
	            });
            }
		}
	});
}else{
	res.json({success : 0});
     }
});


app.post("/enableMFA", function(req, res){
	if(con == null)
	con = db.openCon(con);
	var obj = req.body;
	obj.backupCodeUsed = 0;
	var secretObj = JSON.stringify(obj);

	console.log("enableMFA secretObj = : "+JSON.stringify(secretObj)+"UID = : "+req.session.uid);
	if(req.session.uid != undefined){
		con.query("update users set mfaEnabled = ? , mfaSecret = ? where id = ?", [1,secretObj,req.session.uid], function(err, result){
			if(err){
				console.log(err.stack);
				res.json({success : 0});
			}else{
			console.log("743 . result= : "+JSON.stringify(result));
			res.json({success : 1});
		     }
		});
	}else{
		res.json({success : 0});
	}
});

app.post("/disableMFA", function(req, res){
	if(con == null)
	con = db.openCon(con);
	var secretObj = req.body;
	console.log("disableMFA secretObj = : "+JSON.stringify(secretObj)+"UID = : "+req.session.uid);
	if(req.session.uid != undefined){
		con.query("update users set mfaEnabled = ? , mfaSecret = ? where id = ?", [0,null,req.session.uid], function(err, result){
			if(err){
				console.log(err.stack);
				res.json({success : 0});
			}else {
			console.log("757 . result= : "+JSON.stringify(result));
			res.json({success : 1});
		    }
		});
	}else{
		res.json({success : 0});
	}
});

app.post("/matchMFAToken", function(req, res){
	if(con == null)
	con = db.openCon(con);
	var token = req.body.token;
	console.log("MFA token = : "+JSON.stringify(token) +"    Email ID = : "+req.body.email);
	con.query("select * from users where email = ?", [req.body.email], function(err, result){
		if(err){
			console.log(err.stack);
			res.json({success : 0});
		}
		else if(result.length>0){
			var secret = JSON.parse(result[0].mfaSecret);
			var mfatoken = speakeasy.totp({secret: secret.base32,encoding: 'base32'});
			console.log("mfatoken = "+mfatoken+"     usertoken = "+token+ " backup = : "+secret.hex);
			if(mfatoken == token){
				req.session.email=result[0].email;
				req.session.uid = result[0].id;
			    res.json({success : 1});
				console.log(" token matched ");
			}else if(token == secret.hex) {
				if(secret.backupCodeUsed == 1){
					res.json({success : 0,errmsg : "Backup Token Expired !"});
				}else{
					secret.backupCodeUsed = 1;
					secret = JSON.stringify(secret);
					console.log(" updated secret = ; "+JSON.stringify(secret));
					con.query("update users set  mfaSecret = ? where email = ?", [secret,req.body.email], function(err, result1){
						if(err){
							console.log(err.stack);
							res.json({success : 0});
						}else {
						req.session.email=result[0].email;
						req.session.uid = result[0].id;
					    res.json({success : 1});
						console.log("backup token matched ");
					    }
					});
     		    }
			}else{
				res.json({success : 0,errmsg : "Token not matched !"});
			}
		}
		else{
		  res.json({success : 0 ,errmsg : "ERROR !"});
		}
	});
});

app.post("/resetMFAToken", function(req, res){
	if(con == null)
	con = db.openCon(con);
	var email = req.body.email;
	var userName = req.body.userName;
	var name = userName+"@InfraGuardDashBoard";
	var secret = speakeasy.generateSecret({length: 32,name:name,issuer:"InfraGuard"});
	secret.backupCodeUsed = 0;
	var secretToString = JSON.stringify(secret);
	con.query("update users set  mfaSecret = ?,mfaEnabled = ? where email = ?", [secretToString,1,email], function(err, result){
		if(err){
			console.log(err.stack);
			res.json({success : 0});
		}
		else {
		  QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
	          qrcode = data_url ;// get QR code data URL for mailing
	          saveQRCodeImg(qrcode,email);
	          res.json({success : 1,secret:secret.hex });
	      });
        }
	});
});

app.post("/stopServerKeyRotation", function(req, res){
	if(con == null)
	con = db.openCon(con);
	con.query("update servers set autoKeyRotation = ? where project_id = ?", [0,req.body.projectId], function(err, result){
	if(err)console.log(err.stack);
	res.status(200).json({success : 1});
	});
});

app.post("/startServerKeyRotation", function(req, res){
	if(con == null)
	con = db.openCon(con);
	con.query("update servers set autoKeyRotation = ? where project_id = ?", [1,req.body.projectId], function(err, result){
	if(err)console.log(err.stack);
	res.status(200).json({success : 1});
	});
});

app.post("/updateServerKeyForProject", function(req, res){
	if(con == null)
	con = db.openCon(con);
	con.query("SELECT distinct s.serverIP,u.email,s.id FROM users u INNER JOIN companydetails c ON u.id = c.companyCreator INNER JOIN projectdetails p ON c.id = p.company_id INNER JOIN servers s ON p.id = s.project_id WHERE s.project_id = ?", [req.body.projectId], function(err, result){
	if(err)console.log(err.stack);
	if(result.length>0){
		updateServerKey(result);
	}
	res.status(200).json({success : 1});
	});
});

app.post("/requestServerAccess", function(req, res){
	var email = req.session.email;
	var userName = req.body.name.toLowerCase();
	var pair = keypair();
	var pubKey = forge.pki.publicKeyFromPem(pair.public);
	var sshpubKey = forge.ssh.publicKeyToOpenSSH(pubKey, userName+'@InfraGuard');
	var privateKey = pair.private; 
	var serverIp = req.body.serverIp;
	var email = req.session.email;
	var record = {
				serverIp: req.body.serverIp,
				activityName: "addPubKey",
				requiredData: JSON.stringify({
					publicKey: sshpubKey,
					privKey: privateKey,
					userName: userName,
					email : email
				}),
				status: "0"
			    };
	con.query("insert into agentActivities set ?", [record], function(err1, result1){
		if(err1){
			console.log(err1.stack);
			res.json({success : 0});
		}
		res.json({success : 1});
	});
});

app.post("/refreshProcessList", function(req, res){
if(con == null)
con = db.openCon(con);
var data = req.body;
console.log("refreshProcessList serverIp = : "+data.serverIp+"   userName = : "+data.name);
var record = null;
record = {
	serverIp: data.serverIp,
	activityName: "getProcessList",
	requiredData: JSON.stringify({
		userName: data.name
	}),
	status: "0"
};
Promise.all([
	new Promise((resolve, reject) => {
	con.query("insert into agentActivities set ?", [record], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}
		resolve(result);
	});
})
]).then((results) => {
	res.status(200).json({success: 1});
});
});

app.post("/refreshEnvironmentVars", function(req, res){
if(con == null)
con = db.openCon(con);
var data = req.body;
console.log("refreshEnvironmentVars serverIp = : "+data.serverIp+"   userName = : "+data.name);
var record = null;
record = {
	serverIp: data.serverIp,
	activityName: "getEnv",
	requiredData: JSON.stringify({
		userName: data.name,
		scope:"system_speciifc"
	}),
	status: "0"
};
Promise.all([
	new Promise((resolve, reject) => {
	con.query("insert into agentActivities set ?", [record], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}
		resolve(result);
	});
})
]).then((results) => {
	res.status(200).json({success: 1});
});
});

app.post("/environmentVariablesData", function(req, res){
if(con == null)
con = db.openCon(con);
var envData = req.body.data;
var serverIp = req.body.serverIp;
var id = req.body.id;
var status = req.body.status;
console.log("serverIp = : "+serverIp+"   id = : "+id+"   status = : "+status+"  envData = : "+envData);
	if(status==0){
		Promise.all([
			new Promise((resolve, reject) => {
				con.query("update servers set envVars = ? where serverIP = ?", [envData,serverIp], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
					}
					resolve(result);
				});
		    }),

			new Promise((resolve, reject) => {
				con.query("update agentActivities set status = ? where id = ? ", [1,id], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
					}
					resolve(result);
				});
		    })
		]).then((results) => {
			res.status(200).json({success: "Environment Variables updated"});
		});
	}
	else {
	res.status(200).json({success: "Environment Variables updated"});
	}
});

app.post("/processListData", function(req, res){
if(con == null)
con = db.openCon(con);
var processData = req.body.data;
var serverIp = req.body.serverIp;
var id = req.body.id;
var status = req.body.status;
console.log("serverIp = : "+serverIp+"   id = : "+id+"   status = : "+status+"  processData = : "+processData);
	if(status==0){
		Promise.all([
			new Promise((resolve, reject) => {
				con.query("update servers set processList = ? where serverIP = ?", [processData,serverIp], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
					}
					resolve(result);
				});
		    }),

			new Promise((resolve, reject) => {
				con.query("update agentActivities set status = ? where id = ? ", [1,id], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
					}
					resolve(result);
				});
		    })
		]).then((results) => {
			res.status(200).json({success: "ProcessListData updated"});
		});
    }
	else {
	res.status(200).json({success: "ProcessListData updated"});
	}
});

app.post("/showProcessListData", function(req, res){
	if(con == null)
	con = db.openCon(con);
	con.query("select processList from servers where serverIP like ?", [req.body.serverIp], function(err, result){
		if(err)console.log(err.stack);
		res.status(200).json(result);
	});
});

app.post("/showEnvironmentVariablesData", function(req, res){
	if(con == null)
	con = db.openCon(con);
	con.query("select envVars from servers where serverIP like ?", [req.body.serverIp], function(err, result){
		if(err)console.log(err.stack);
		res.status(200).json(result);
	});
});

app.post("/refreshAuditLogin", function(req, res){
	if(con == null)
	con = db.openCon(con);
	var data = req.body;
	console.log("refreshProcessList serverIp = : "+data.serverIp+"   userName = : "+data.name);
	var record = null;
	record = {
		serverIp: data.serverIp,
		activityName: "auditLogin",
		requiredData: JSON.stringify({
			userName: data.name
		}),
		status: "0"
	};
	Promise.all([
		new Promise((resolve, reject) => {
		con.query("insert into agentActivities set ?", [record], function(err, result){
			if(err){
				console.log(err.stack);
				resolve(null);
			}
			resolve(result);
		});
	})
	]).then((results) => {
		res.status(200).json({success: 1});
	});
});

app.post("/showAuditLoginData", function(req, res){
	if(con == null)
	con = db.openCon(con);
	con.query("select auditLogin from servers where serverIP like ?", [req.body.serverIp], function(err, result){
		if(err)console.log(err.stack);
		res.status(200).json(result);
	});
});

app.post("/auditLoginData", function(req, res){
if(con == null)
con = db.openCon(con);
var auditData = req.body.data;
var serverIp = req.body.serverIp;
var id = req.body.id;
var status = req.body.status;
console.log("serverIp = : "+serverIp+"   id = : "+id+"   status = : "+status+"  processData = : "+processData);
	if(status==0){
		Promise.all([
			new Promise((resolve, reject) => {
				con.query("update servers set auditLogin = ? where serverIP = ?", [auditData,serverIp], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
					}
					resolve(result);
				});
		    }),

			new Promise((resolve, reject) => {
				con.query("update agentActivities set status = ? where id = ? ", [1,id], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
					}
					resolve(result);
				});
		    })
		]).then((results) => {
			res.status(200).json({success: "AuditLoginData updated"});
		});
    }
	else {
	res.status(200).json({success: "AuditLoginData updated"});
	}
});

app.post("/runSriptOnServer", function(req, res){
if(con == null)
con = db.openCon(con);
var data = req.body;
console.log("refreshProcessList serverIp = : "+data.serverIp+"   userName = : "+data.name);
var record = null;
record = {
	serverIp: data.serverIp,
	activityName: "scriptManager",
	requiredData: JSON.stringify({
		userName: data.name,
		script : data.script
	}),
	status: "0"
};
Promise.all([
	new Promise((resolve, reject) => {
	con.query("insert into agentActivities set ?", [record], function(err, result){
		if(err){
			console.log(err.stack);
			resolve(null);
		}
		resolve(result);
	});
})
]).then((results) => {
	res.status(200).json({success: 1});
});
});

app.post("/scriptExecuttionStatus", function(req, res){
if(con == null)
con = db.openCon(con);
var auditData = req.body.data;
var serverIp = req.body.serverIp;
var id = req.body.id;
var status = req.body.status;
console.log("serverIp = : "+serverIp+"   id = : "+id+"   status = : "+status+"  processData = : "+processData);
	if(status==0){
		Promise.all([
			new Promise((resolve, reject) => {
				con.query("update agentActivities set status = ? where id = ? ", [1,id], function(err, result){
					if(err){
						console.log(err.stack);
						resolve(null);
					}
					resolve(result);
				});
		    })
		]).then((results) => {
			res.status(200).json({success: "ScriptExecutionStatus updated"});
		});
    }
	else {
	res.status(200).json({success: "ScriptExecutionStatus updated"});
	}
});

}

function updateServerKey(dataset){
if(con == null)
con = db.openCon(con);
var data = [];
	for(var i=0;i<dataset.length;i++){
		var pair = keypair();
		var pubKey = forge.pki.publicKeyFromPem(pair.public);
		var sshpubKey = forge.ssh.publicKeyToOpenSSH(pubKey, 'default@InfraGuard');
		var privateKey = pair.private; 
		var serverIp = dataset[i].serverIP;
		var email = dataset[i].email;
		var record = [];
		record = [
		    serverIp,
		    "updateServerDefaultUserKey",
		    JSON.stringify({publicKey: sshpubKey,privKey:privateKey,email:email}),
		    "0"
			];	
		data.push(record);
	}
	con.query("insert into agentActivities (serverIp,activityName,requiredData,status) values ?", [data], function(err, result){
		if(err)console.log(err.stack);
			console.log(" updateServerKey data inserted into agent activities");
	}
	);

console.log('running task = updateServerKey every minute. This will get executed on 1st of every month');
}

function revokeServerAccess(){
	var data = [];
	if(con == null)
	con = db.openCon(con);
    con.query("select * from userServerAccessStatus where accessStatus = ?", [1], function(err, result) {
    if (err) console.log("signup_error: ", err.stack); 
	if (result.length > 0) {
		for(var i=0;i<result.length;i++){
		record = [
		    result[i].serverIP,
		    "deletePubKey",
		    JSON.stringify({userName: result[i].userName}),
		    "0"
		];	
		data.push(record);
	}
	con.query("insert into agentActivities (serverIp,activityName,requiredData,status) values ?", [data], function(err1, result1){
		if(err1){
			console.log(err1.stack);
		}
	});
	}
 });
 console.log('running task = revokeServerAccess every day. This will get executed every day');
}

function saveQRCodeImg(qrcode,email){
	var base64Data = qrcode.replace(/^data:image\/png;base64,/, "");
    require("fs").writeFile("./angular/images/qrcode/"+email+".png", base64Data, 'base64', function(err) {
	 	console.log(err);
	});
}

//User registration process : create user , create account and map user to account 
//do this process in transaction i.e. either all tables are populated or none(rollback)
function signupAction(req, res, data){
	
	if(con == null)
	con = db.openCon(con);
    con.query("select email from users where email = ?", [data.email], function(err, result) {
		if (err) console.log("signup_error: ", err.stack); 
		if (result.length > 0) {
			res.json({success : 0});
		}
		else {
			con.beginTransaction(function(err) {
		    if (err) { console.log(err.stack); }
            data.shell = "/bin/bash";
            data.linuxName = data.uname;
            data.createdOn = new Date();
                con.query("insert into users set ? ", data, function(err, result){
					if(err){
						return con.rollback(function() {
		                    console.log(err.stack);
		                    res.json({success : "error"});
	                    });
					}
					if(data.userRegistration == "self"){
						var account ={
										accountName : data.email.split('@')[0],
										accountOwnerEmail : data.email,
										accountOwnerId : result.insertId
						            };
						con.query("insert into useraccount set ? ", account, function(err, result1){
							if(err){
							  return con.rollback(function() {
			                      console.log(err.stack);
			                      res.json({success : "error"});
		                        });
							}
							var data1 ={
										userId : result.insertId,
										accountId : result1.insertId
						                };
						    con.query("insert into userhasaccount set ? ", data1, function(err, result2){
								if(err){
									return con.rollback(function() {
				                      console.log(err.stack);
				                      res.json({success : "error"});
				                    });
								}
								con.commit(function(err) {
							        if (err) {
							            return con.rollback(function() {
							                console.log(err.stack);
							            });
							        }
							        console.log(" User registration(self) process successful email : "+data.email);
								    res.json({success : 1});
							    });
							});
						});
	                }
	                else{
	                	console.log(" User registration(infraguard) process successful email : "+data.email);
	                	res.json({success : 1});
	                }
				});
			});
        }
	});
}

// match password and fetch associated accounts data
function loginAction(req, res, data){
	if(con == null)
	con = db.openCon(con);
	con.query("SELECT * FROM users WHERE email = ? ", data.email, function(err, result){
		if(err)console.log("select error: ", err.stack);
		if (result.length > 0) {
			var passwValid = bcryptPassw.compareHash(data.passw, result[0].passw);
			if(passwValid){
				if(result[0].mfaEnabled == 0){
				req.session.email=result[0].email;
				req.session.uid = result[0].id;
			    }
			    con.query("SELECT * FROM useraccount ua INNER JOIN userhasaccount uha ON ua.accountId = uha.accountId WHERE uha.userId = ? ", [result[0].id], function(err, result1){
					if(err)console.log(err.stack);
					if(result1.length > 0){
						var userdata = {success: 1 ,userId:result[0].id, uname : result[0].uname, email : result[0].email, mfa : result[0].mfaEnabled,accounts:result1};
						res.status(200).json(userdata);
					}
					
			    });
				//var data1 = {success: 1 , uname : result[0].uname, email : result[0].email, mfa : result[0].mfaEnabled};
				//res.status(200).json(data1);
			} else {
				res.status(200).json({success : 0, error : "email/password not valid"});
			}

		} else {
			res.status(200).json({success : 0, error : "email/password not valid"});
		}
		//con.destroy();
	});
}

// fetch user data (resources+privileges) on accountId and userId
function getUserData(req, res){
	
	var accountOwnerId = req.body.accountOwnerId;
	var accountId = req.body.accountId;
	console.log("RouteJs accountId = : "+accountId+" Account Owner Id = : "+accountOwnerId+"   LoggedIn User = : "+req.session.email);
	
	if(con == null)
	con = db.openCon(con);
	var obj = {};
	obj.userdata = null;
	obj.companydata = null;
	obj.projectdata = null;
	Promise.all([
	
		new Promise((resolve, reject) => {
			con.query("SELECT * FROM users WHERE (email = ? )", [req.session.email], function(err, result){
				if(err)console.log(err.stack);
				if (result.length > 0) {
					resolve(result[0]);
				}
			  resolve(null);
			});
		}),
		
		new Promise((resolve, reject) => {
			con.query("SELECT * FROM companydetails WHERE companyCreator = ? ", [accountOwnerId], function(err, result){
				if(err)console.log(err.stack);
				if(result.length > 0){
					resolve(result);
				}
				resolve(null);
			});
		}),

		new Promise((resolve, reject) => {
			con.query("SELECT * FROM companydetails c INNER JOIN projectdetails p ON c.id = p.company_id "+
				"WHERE c.companyCreator = ? ", [accountOwnerId], function(err, result){
				if(err)console.log(err.stack);
				if(result.length > 0){
					resolve(result);
				}
				resolve(null);
			});
		}),

		new Promise((resolve, reject) => {
			con.query("SELECT * FROM useraccount WHERE accountId = ? ", [accountId], function(err, result){
				if(err)console.log(err.stack);
				if(result.length > 0){
					resolve(result);
				}
				resolve(null);
			});
		}),
    
		new Promise((resolve, reject) => {
			con.query("select * from groups g inner join grouphasusers ghu	on g.groupId = ghu.groupId inner"+ 
				" join grouphasroles ghr on g.groupId = ghr.groupId	inner join roles r	on r.roleId = ghr.roleId"+
				" where g.accountId = ? and ghu.userId = ?", [accountId,req.session.uid], function(err, result){
				if(err)console.log(err.stack);
				console.log(" roles result = :  "+JSON.stringify(result));
				if(result.length > 0){
					resolve(JSON.stringify(result));
				}
				resolve(null);
			});
		})

	]).then(function(results){
		obj.userdata = results[0];
		obj.companydata = results[1];
		obj.projectdata = results[2];
		obj.accountdata = results[3];
		obj.userroles = results[4];
		res.status(200).json(obj);
	});
	
}


