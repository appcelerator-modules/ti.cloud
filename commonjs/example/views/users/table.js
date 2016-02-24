var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
WindowManager.include(

	'/views/users/loginStatus',
	'/views/users/create',
	'/views/users/login',
	'/views/users/logout',
	'/views/users/query',
	'/views/users/remove',
	'/views/users/requestResetPassword',
	'/views/users/resendConfirmation',
	'/views/users/search',
	'/views/users/show',
	'/views/users/showMe',
	'/views/users/update'
);
exports['Users'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white'
	});
	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		color: 'black',
		data: Utils.createRows([
			'Login Status',
			'Create User',
			'Login User',
			'Request Reset Password',
			'Resend Confirmation',
			'Show Current User',
			'Update Current User',
			'Remove Current User',
			'Logout Current User',
			'Query User',
			'Search User'
		])
	});
	table.addEventListener('click', WindowManager.handleOpenWindow);
	win.add(table);
	return win;
};
