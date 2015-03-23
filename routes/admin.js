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
	//TODO: get currentInvitees from db.
	db.preUse();
	//var currentInvitees = {invitees: ["Wang Wei", "Lin Tingting"]};
	db.Db.collection("invitees").find({}, function(err, result){
		console.log(result);
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
			//TODO: create QRcode here with saved, saved is the new record.
			
		}
	);
	//db.postUse();
	res.redirect('/admin');
}

exports.removeInvitee = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	db.Db.collection("invitees").remove({_id: db.ObjectId(p_id)});
	//TODO: remove qrcode too.
	
	//db.postUse();
	res.redirect('/admin');
}

exports.genQR = function(id){
	var qr_png = qr.image('https://mariage-caesarhao.rhcloud.com/invitee/?id=' + id, { type: 'png' });
	qr_png.pipe(fs.createWriteStream('../public/images/qrs/' + id + '.png'));
	return (id + '.png');
}

exports.removeQR = function(id){
	fs.unlinkSync('../public/images/qrs/' + id + '.png');
}

