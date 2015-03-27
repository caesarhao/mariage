/**
* used to show invitation.
*/
var db = require('./db');
exports.invitation = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	db.Db.collection("invitees").find({_id: db.ObjectId(p_id)}, function(err, result){
		if(!err){
			return res.render('invitation', {invitee:result[0]} );
		}
	});
};

