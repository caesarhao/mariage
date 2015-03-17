/**
* used to connect the database.
*/

var mongo = require('mongodb');

var isConnected = false;

exports.isConnected = function(){
	return isConnected;
}

exports.init = function(){
	if (isConnected){
		return;
	}
	var dbHost = process.env.OPENSHIFT_MONGODB_DB_HOST;
	if (dbHost === "undefined"){
		var dbServer = new mongodb.Server('localhost', 27017);
		exports.Db = new mongodb.Db('mariage', dbServer, {auto_reconnect: true});
		exports.dbUser = 'admin';
		exports.dbPass = 'admin';
	}
	else{
		var dbServer = new mongodb.Server(process.env.OPENSHIFT_MONGODB_DB_HOST, parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT));
		exports.Db = new mongodb.Db(process.env.OPENSHIFT_APP_NAME, dbServer, {auto_reconnect: true});
		exports.dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
		exports.dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;
	}
}

exports.connectDb = function(){
	if (isConnected){
		return;
	}
	exports.Db.open(function(err, db){
		if(err){
			throw err;
		};
		exports.Db.authenticate(exports.dbUser, exports.dbPass, {authdb: "admin"}, function(err, res){
			if(err){ 
				throw err;
			};
		});
		exports.Db.on('close', function(){
			isConnected = false;
		});
	});
	isConnected = true;
};

exports.disconnect = function(){
	exports.Db.logout();
	exports.Db.close();
	isConnected = false;
}

