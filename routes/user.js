/**
* used to control the login/logout for the manager. 
*/


exports.login = function(req, res){
	if (req.session.user){
		res.redirect('/admin');
	}
	else{
		res.render('user_login');
	}
}

exports.auth = function(req, res){
	if ('hao' == req.param('user') && 'jing' == req.param('pwd')){
		req.session.user = 'hao';
		res.redirect('/admin');
	}
	else{
		res.render('user_login', {message: "Login failed, try again!"});
	}
}

exports.logout = function(req, res){
	req.session.destroy();
	res.redirect('/login');
}

