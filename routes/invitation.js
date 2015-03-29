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
			db.Db.collection("presents").find({}, function(err, result2){ // select a present.
				if(!err){
					db.Db.collection("presents").find({}, function(err, result3){ // select a present.
						if(!err){
							res.render('invitation', {invitee: result1[0], presents: result2, present: result3} );
						}
					});
				}
			});
		}
		else{
			res.send(404);
			return;
		}
	});
};

exports.assignPresent = function(req, res){
	db.preUse();
	//TODO: assignPresent
	res.redirect('/invitation?id='+req.param('id'));
}

exports.dissociatePresent = function(req, res){
	db.preUse();
	//TODO
}

