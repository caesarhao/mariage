/**
* used to control the invitees 
*/
var db = require('./db');
var qr = require('qr-image');
var fs = require('fs');

exports.admin = function(req, res){
	if (!req.session.user){
		res.redirect('/login');
		return;
	}
	//DONE: get currentInvitees from db.
	db.preUse();
	//var currentInvitees = {invitees: ["Wang Wei", "Lin Tingting"]};
	db.Db.collection("invitees").find({}, function(err, result){
		//console.log(result);
		res.render('admin', {user: req.session.user, invitees: result});
		//db.postUse();
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
			}
		}
	);
	//db.postUse();
	res.redirect('/admin');
}

exports.removeInvitee = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	db.Db.collection("invitees").remove({_id: db.ObjectId(p_id)});
	//DONE: remove qrcode too.
	exports.removeQR(p_id);
	//db.postUse();
	res.redirect('/admin');
}

exports.removeAllInvitees = function(req, res){
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
		}
	});
	var fullPath = 'public/images/qrs/' + p_id + '.png';
	fs.exists(fullPath, 
		function(exists){
			if(!exists){
				exports.genQR(p_id);
			}
			res.download(fullPath, firstname + '.png', function(err){});
		}
	);
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

