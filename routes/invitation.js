/**
* used to show invitation.
*/
var db = require('./db');
var admin = require('./admin');
exports.invitation = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	db.Db.collection("invitees").find({_id: db.ObjectId(p_id)}, function(err, result1){
		if(!err){
			db.Db.collection("presents").find({_id: db.ObjectId(p_id)}, function(err, result2){
				if(!err){
					//TODO: just add not assigned presents here.
					return res.render('invitation', {invitee:result1[0], presents:result2} );
				}
			});
		}
	});
};

