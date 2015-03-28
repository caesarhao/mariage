/**
* used to control the invitees 
*/
var db = require('./db');
var qr = require('qr-image');
var fs = require('fs');

function checkLogin(req, res){
	if (!req.session.user){
		res.redirect('/login');
		return;
	}
}

exports.admin = function(req, res){
	checkLogin(req, res);
	//DONE: get currentInvitees from db.
	db.preUse();
	db.Db.collection("invitees").find({}, function(err, result1){
		db.Db.collection("presents").find({}, function(err, result2){
			res.render('admin', {user: req.session.user, invitees: result1, presents:result2});
		});
	});
}
/**
* invitee structure in collection invitees
 {
 	_id: Int,
 	firstname: String,
 	lastname: String,
 	lang: [ZH, FR, EN],
 	actType: [dinner, barbecue]
 }
*/

exports.addInvitee = function(req, res){
	checkLogin(req, res);
	db.preUse();
	var p_firstname = req.param('firstname');
	var p_lastname = req.param('lastname');
	var p_lang = req.param('lang');
	var p_actType = req.param('actType');
	var newInvitee = {firstname: p_firstname, lastname: p_lastname, lang: p_lang, actType: p_actType};
	db.Db.collection("invitees").insert(newInvitee, 
		function(err, saved){
			//DONE: create QRcode here with saved, saved is the new record.
			if(!err){
				exports.genQR(saved._id);
				res.redirect('/admin');
			}
		}
	);
	//db.postUse();
	
}

exports.removeInvitee = function(req, res){
	checkLogin(req, res);
	db.preUse();
	var p_id = req.param('id');
	db.Db.collection("invitees").remove({_id: db.ObjectId(p_id)});
	//DONE: remove qrcode too.
	exports.removeQR(p_id);
	//db.postUse();
	res.redirect('/admin');
}

exports.removeAllInvitees = function(req, res){
	checkLogin(req, res);
	db.preUse();
	db.Db.collection("invitees").find({}, function(err, result){
		if(!err){
			var i = 0;
			for (i = 0; i < result.length; i++){
				db.Db.collection("invitees").remove({_id: db.ObjectId(result[i]._id)});
				//remove qrcode too.
				exports.removeQR(result[i]._id);
			}
		}
	});
	res.redirect('/admin');
}


exports.downloadQR = function(req, res){
	var p_id = req.param('id');
	var firstname = 'Anonyme';
	db.preUse();
	db.Db.collection("invitees").find({_id: db.ObjectId(p_id)}, function(err, result){
		if(!err){
			firstname = result[0].firstname;
			//console.log(firstname);
			var fullPath = 'public/images/qrs/' + p_id + '.png';
			fs.exists(fullPath, 
				function(exists){
					if(!exists){
						exports.genQR(p_id);
					}
					res.download(fullPath, encodeURIComponent(firstname + '.png'), function(err){});
				}
			);
		}
	});
}

exports.genQR = function(id){
	if(!fs.existsSync('public/images/qrs')){
		fs.mkdirSync('public/images/qrs');
	}
	var qr_png = qr.image('http://mariage-caesarhao.rhcloud.com/invitation?id=' + id, { type: 'png' });
	qr_png.pipe(fs.createWriteStream('public/images/qrs/' + id + '.png'));
	return (id + '.png');
}

exports.removeQR = function(id){
	var fullPath = 'public/images/qrs/' + id + '.png';
	
	fs.exists(fullPath, 
		function(exists){
			if(exists){
				fs.unlinkSync(fullPath);
			}
		}
	);
}

/**
* present structure in collection presents
 {
 	_id: Int,
 	nameZH: String,
 	nameFR: String,
 	price: Float
 }
*/
exports.addPresent = function(req, res){
	checkLogin(req, res);
	db.preUse();
	var p_nameZH = req.param('nameZH');
	var p_nameFR = req.param('nameFR');
	var p_price = req.param('price');
	var p_split = req.param('split');
	var newPresents=new Array();
	if (1 == p_split){
		newPresents.push({nameZH: p_nameZH, nameFR: p_nameFR, price: p_price});
	}
	else{
		for (var i = 0; i < p_split; i++){
			newPresents.push({nameZH: p_nameZH+'_'+i, nameFR: p_nameFR+'_'+i, price: (p_price/p_split).toFixed(2)});
		}
	}
	db.Db.collection("presents").insert(newPresents, 
		function(err, saved){
			//DONE:.
			if(!err){
				res.redirect('/admin');
			}
		}
	);
}

exports.removePresent = function(req, res){
	checkLogin(req, res);
	db.preUse();
	var p_id = req.param('id');
	db.Db.collection("presents").remove({_id: db.ObjectId(p_id)});
	res.redirect('/admin');
}

