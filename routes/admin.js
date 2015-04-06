/**
* used to control the invitees 
*/
var db = require('./db');
var qr = require('qr-image');
var fs = require('fs');

var PriceInterval = 30.0;

function checkLogin(req, res){
	if (!req.session.user){
		res.redirect('/login');
		return;
	}
}

exports.index = function(req, res){
	db.preUse();
	var p_lang = req.param('lang') || "";
	db.Db.collection("presents").find({}, function(err1, result1){
		db.Db.collection("invitees").find({}, function(err2, result2){
			for (var i = 0; i<result1.length; i++){
				if (result1[i].hasOwnProperty('inviteeId')){
					for (var j = 0; j<result2.length; j++){
						if (result2[j]._id == result1[i].inviteeId){
							result1[i].inviteeName = result2[j].lastname + ' ' + result2[j].firstname;
							break;
						}
					}
				}
			}
			
			if (0 < p_lang.length){
				res.render('index', {presents:result1, lang:p_lang});
			}
			else{
				res.render('index', {presents:result1});
			}
			
		});
	});
}

exports.admin = function(req, res){
	checkLogin(req, res);
	//DONE: get currentInvitees from db.
	var numInvitees = 0;
	var numAttendDinner = 0;
	var numAttendDinnerCouples = 0;
	var numAttendBarbcue = 0;
	var numAttendBarbcueCouples = 0;
	db.preUse();
	db.Db.collection("invitees").find({}, function(err1, result1){
		db.Db.collection("presents").find({}, function(err2, result2){
			for (var i = 0; i<result1.length; i++){
				if (result1[i].hasOwnProperty('presentId')){
					for (var j = 0; j<result2.length; j++){
						if (result2[j]._id == result1[i].presentId){
							result1[i].presentNameFR = result2[j].nameFR;
							result1[i].presentNameZH = result2[j].nameZH;
							result2[j].inviteeName = result1[i].lastname + ' ' + result1[i].firstname;
							break;
						}
					}
				}
				// count numbers
				if ('dinner' == result1[i].actType){
					if (0 < result1[i].buddy.length){
						numAttendDinner += 2;
						numAttendDinnerCouples += 1;
						numInvitees += 2;
					}
					else{
						numAttendDinner += 1;
						numInvitees += 1;
					}
				}
				else{
					if (0 < result1[i].buddy.length){
						numAttendBarbcue += 2;
						numAttendBarbcueCouples += 1;
						numInvitees += 2;
					}
					else{
						numAttendBarbcue += 1;
						numInvitees += 1;
					}
				}
			}
			var statisticInfo = {NumInvitees:numInvitees, NumAttendDinner: numAttendDinner, NumAttendDinnerCouples: numAttendDinnerCouples, NumAttendBarbcue: numAttendBarbcue, NumAttendBarbcueCouples: numAttendBarbcueCouples};
			res.render('admin', {user: req.session.user, invitees: result1, presents:result2, StatisticInfo: statisticInfo});
		});
	});
}
/**
* invitee structure in collection invitees
 {
 	_id: Int,
 	firstname: String,
 	lastname: String,
 	buddy: String, (optional)
 	lang: [ZH, FR, EN],
 	actType: [dinner, barbecue],
 	presentId: String (Optional)
 }
*/

exports.addInvitee = function(req, res){
	checkLogin(req, res);
	db.preUse();
	var p_id = req.param('id');
	var p_firstname = req.param('firstname');
	var p_lastname = req.param('lastname');
	var p_buddy = req.param('buddy');
	var p_lang = req.param('lang');
	var p_actType = req.param('actType');
	var newInvitee = {firstname: p_firstname, lastname: p_lastname, buddy: p_buddy, lang: p_lang, actType: p_actType};
	if ("" == p_id){ // insert a new one.
		db.Db.collection("invitees").insert(newInvitee, 
			function(err, saved){
				//DONE: create QRcode here with saved, saved is the new record.
				if(!err){
					exports.genQR(saved._id);
					return res.redirect('/admin');
				}
			}
		);
	}
	else{ // update.
		db.Db.collection("invitees").find({_id: db.ObjectId(p_id)}, 
			function(err1, result1){
				var invitee = result1[0];
				for (var key in newInvitee){
					invitee[key] = newInvitee[key];
				}
				db.Db.collection("invitees").update({_id: db.ObjectId(p_id)}, invitee, 
					function(err2, saved2){
						if(!err2){
							exports.genQR(p_id);
							return res.redirect('/admin');
						}
					}
				);
			}
		);
	}
}

exports.removeInvitee = function(req, res){
	checkLogin(req, res);
	db.preUse();
	var p_id = req.param('id');
	db.Db.collection("invitees").find({_id: db.ObjectId(p_id)}, 
		function(err1, result1){
			var invitee = result1[0];
			if (invitee.hasOwnProperty('presentId')){//delete present relation.
				deleteInviteePresentRelation(p_id, invitee.presentId, 
					function(){
						db.Db.collection("invitees").remove({_id: db.ObjectId(p_id)});
						//DONE: remove qrcode too.
						exports.removeQR(p_id);
					}
				);
			}
			else{
				db.Db.collection("invitees").remove({_id: db.ObjectId(p_id)});
				//DONE: remove qrcode too.
				exports.removeQR(p_id);
			}
		}
	);
	res.redirect('/admin');
}

exports.removeAllInvitees = function(req, res){
	checkLogin(req, res);
	db.preUse();
	db.Db.collection("invitees").find({}, function(err, result){
		if(!err){
			var i = 0;
			for (i = 0; i < result.length; i++){
				db.Db.collection("invitees").remove({_id: db.ObjectId(result[i]._id)});
				//remove qrcode too.
				exports.removeQR(result[i]._id);
			}
		}
	});
	res.redirect('/admin');
}


exports.downloadQR = function(req, res){
	var p_id = req.param('id');
	var firstname = 'Anonyme';
	db.preUse();
	db.Db.collection("invitees").find({_id: db.ObjectId(p_id)}, function(err, result){
		if(!err){
			firstname = result[0].firstname;
			//console.log(firstname);
			var fullPath = 'public/images/qrs/' + p_id + '.png';
			fs.exists(fullPath, 
				function(exists){
					if(!exists){
						exports.genQR(p_id);
					}
					res.download(fullPath, encodeURIComponent(firstname + '.png'), function(err){});
				}
			);
		}
	});
}

exports.genQR = function(id){
	if(!fs.existsSync('public/images/qrs')){
		fs.mkdirSync('public/images/qrs');
	}
	var qr_png = qr.image('https://mariage-caesarhao.rhcloud.com/invitation?id=' + id, { type: 'png' });
	qr_png.pipe(fs.createWriteStream('public/images/qrs/' + id + '.png'));
	return (id + '.png');
}

exports.removeQR = function(id){
	var fullPath = 'public/images/qrs/' + id + '.png';
	
	fs.exists(fullPath, 
		function(exists){
			if(exists){
				fs.unlinkSync(fullPath);
			}
		}
	);
}

/**
* present structure in collection presents
 {
 	_id: Int,
 	nameZH: String,
 	nameFR: String,
 	price: Float,
 	inviteeId: String (Optional)
 }
*/
exports.addPresent = function(req, res){
	checkLogin(req, res);
	db.preUse();
	var p_id = req.param('id');
	var p_nameZH = req.param('nameZH');
	var p_nameFR = req.param('nameFR');
	var p_price = req.param('price');
	var p_split = req.param('split');
	var newPresents=new Array();
	
	if (1 == p_split){
		newPresents.push({nameZH: p_nameZH, nameFR: p_nameFR, price: p_price});
	}
	else{
		for (var i = 0; i < p_split; i++){
			newPresents.push({nameZH: p_nameZH+'_'+i, nameFR: p_nameFR+'_'+i, price: (p_price/p_split).toFixed(2)});
		}
	}
	//console.log(newPresents);
	if ("" == p_id){ // insert a new one.
		
		db.Db.collection("presents").insert(newPresents, 
			function(err, saved){
				//DONE:.
				if(!err){
					res.redirect('/admin');
				}
			}
		);
	}
	else{ // update.
		db.Db.collection("presents").find({_id: db.ObjectId(p_id)}, 
			function(err1, result1){
				var present = result1[0];
				for (var key in newPresents[0]){
					present[key] = newPresents[0][key];
				}
				db.Db.collection("presents").update({_id: db.ObjectId(p_id)}, present, 
					function(err2, saved2){
						if(!err2){
							res.redirect('/admin');
						}
					}
				);
			}
		);
	}
}

exports.removePresent = function(req, res){
	checkLogin(req, res);
	db.preUse();
	var p_id = req.param('id');
	db.Db.collection("presents").find({_id: db.ObjectId(p_id)}, 
		function(err1, result1){
			var present = result1[0];
			if (present.hasOwnProperty('inviteeId')){//delete invitee relation.
				deleteInviteePresentRelation(present.inviteeId, p_id, 
					function(){
						db.Db.collection("presents").remove({_id: db.ObjectId(p_id)});
					}
				);
			}
			else{
				db.Db.collection("presents").remove({_id: db.ObjectId(p_id)});
			}
		}
	);
	res.redirect('/admin');
}



exports.invitation = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	if (24 !== p_id.length){
		res.send(404);
		return;
	}
	db.Db.collection("invitees").find({_id: db.ObjectId(p_id)}, function(err1, result1){
		if(!err1){
			if (1 > result1.length){
				res.send(404);
				return;
			}
			var invitee = result1[0];
			var presentsToBeSelected=[];
			//DONE: just add not assigned presents here.
			db.Db.collection("presents").find({inviteeId:{$exists:false}}, function(err2, result2){ // all presents not assigned.
				if(!err2){
					if ('dinner' == invitee.actType){
						for (var i = 0; i < result2.length; i++){
							if (PriceInterval <= result2[i].price){
								presentsToBeSelected.push(result2[i]);
							}
						}
					}
					else{
						for (var i = 0; i < result2.length; i++){
							if (PriceInterval >= result2[i].price){
								presentsToBeSelected.push(result2[i]);
							}
						}
					}
					db.Db.collection("presents").find({inviteeId: p_id}, function(err3, result3){ // find the present assigned to this invitee.
						if(!err3){
							return res.render('invitation', {invitee: result1[0], presents: presentsToBeSelected, present: result3} );
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
	//DONE: assignPresent
	// check the invitee hasn't selected present.
	// check the present hasn't been selected.
	// add assign relation.
	var p_id = req.param('id');
	var p_inviteeId = req.param('inviteeId');
	var p_presentId = req.param('presentId');
	db.Db.collection("presents").find({inviteeId:{$exists:false}}, function(err0, result0){ // all presents not assigned.
		if(!err0){
			db.Db.collection("invitees").find({_id: db.ObjectId(p_inviteeId)}, function(err1, result1){
				if(!err1){
					var invitee = result1[0];
					if (invitee.hasOwnProperty('presentId')){ // has selected present.
						res.redirect('/invitation?id='+p_inviteeId);
					}
					else{
						db.Db.collection("presents").find({_id: db.ObjectId(p_presentId)}, 
							function(err2, result2){
								if(!err2){
									var present = result2[0];
									if (present.hasOwnProperty('inviteeId')){ // has been selected by other invitees.
										res.render('invitation', {invitee: invitee, presents: result0, present: [], alertmsg:"This present has been selected, please select another one."} );
									}
									else{//assign the relation.
										invitee.presentId = p_presentId;
										db.Db.collection("invitees").update({_id: db.ObjectId(p_inviteeId)}, invitee, 
											function(err3, result3){
												if(!err3){
													present.inviteeId = p_inviteeId;
													db.Db.collection("presents").update({_id: db.ObjectId(p_presentId)}, present, 
														function(err4, result4){
															if(!err4){
																return res.redirect('/invitation?id='+p_inviteeId);
															}
														}
													);
												}	
											}
										);
									}
								}
							}
						);
					}
				}
			});
		}
	});
}

function deleteInviteePresentRelation(inviteeId, presentId, callback){
	db.preUse();
	db.Db.collection("invitees").update({_id: db.ObjectId(inviteeId)}, {$unset:{presentId: ""}}, 
		function(err1, result1){
			db.Db.collection("presents").update({_id: db.ObjectId(presentId)}, {$unset:{inviteeId: ""}}, 
				function(err2, result2){
					callback();
				}
			);
		}
	);
}

exports.dissociatePresent = function(req, res){
	db.preUse();
	var p_id = req.param('id');
	var p_inviteeId = req.param('inviteeId');
	var p_presentId = req.param('presentId');
	db.Db.collection("invitees").update({_id: db.ObjectId(p_inviteeId)}, {$unset:{presentId: ""}}, 
		function(err1, result1){
			db.Db.collection("presents").update({_id: db.ObjectId(p_presentId)}, {$unset:{inviteeId: ""}}, 
				function(err2, result2){
					res.redirect("/admin");
				}
			);
		}
	);
}

