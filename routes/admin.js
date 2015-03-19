/**
* used to control the invitees 
*/
var db = require('./db');

exports.admin = function(req, res){
	//TODO: get currentInvitees from db.
	db.preUse();
	//var currentInvitees = {invitees: ["Wang Wei", "Lin Tingting"]};
	db.Db.collection("invitees").find({}, function(err, result){
		console.log(result);
		res.render('admin', {invitees: result});
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

