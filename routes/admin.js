/**
* used to control the invitees 
*/
var db = require('./db');

exports.admin = function(req, res){
	//TODO: get currentInvitees from db.
	var currentInvitees = {invitees: ["Wang Wei", "Lin Tingting"]};
	res.render('admin', currentInvitees);
}

