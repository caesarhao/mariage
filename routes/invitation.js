/**
* used to show invitation.
*/
var db = require('./db');
var admin = require('./admin');
exports.invitation = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	if (24 !== p_id.length){
		res.send(404);
		return;
	}
	db.Db.collection("invitees").find({_id: db.ObjectId(p_id)}, function(err, result1){
		if(!err){
			//TODO: just add not assigned presents here.
			db.Db.collection("presents").find({}, function(err, result2){
				if(!err){
					res.render('invitation', {invitee:result1[0], presents:result2} );
				}
			});
		}
		else{
			res.send(404);
			return;
		}
	});
};

