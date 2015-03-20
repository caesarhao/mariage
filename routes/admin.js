/**
* used to control the invitees 
*/
var db = require('./db');

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
	db.Db.collection("invitees").insert({firstname: p_firstname, lastname: p_lastname, lang: p_lang, actType: p_actType});
	//db.postUse();
	res.redirect('/admin');
}

exports.removeInvitee = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	db.Db.collection("invitees").remove({_id: db.ObjectId(p_id)});
	//db.postUse();
	res.redirect('/admin');
}

