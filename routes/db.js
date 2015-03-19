/**
* used to connect the database.
*/

var mongojs = require('mongojs');

// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/mariage';

var isConnected = false;

exports.isConnected = function(){
	return isConnected;
}

exports.init = function(){
	if (isConnected){
		return;
	}
	// if OPENSHIFT env variables are present, use the available connection info:
	if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
		  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
		  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
		  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
		  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
		  process.env.OPENSHIFT_APP_NAME;
	}
	exports.Db = mongojs(connection_string);
	exports.Db.on('ready',function() {
		isConnected = true;
    	console.log('database connected');
	});
}

exports.disconnect = function(){
	exports.Db.close();
	isConnected = false;
}

exports.preUse = function(){
	exports.init();
}

exports.postUse = function(){
	exports.disconnect();
}

