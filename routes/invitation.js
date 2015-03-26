/**
* used to show invitation.
*/
var db = require('./db');
exports.invitation = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	var pInvitee = {firstname:"", lastname:"", lang:"", actType:""};
	db.Db.collection("invitees").find({_id: db.ObjectId(p_id)}, function(err, result){
		if(!err){
			pInvitee = result[0];
			console.log(pInvitee);
		}
	});
	res.render('invitation', {invitee:pInvitee});
};

