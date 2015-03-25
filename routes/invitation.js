/**
* used to show invitation.
*/
var db = require('./db');
exports.invitation = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	res.render('invitation');
};

