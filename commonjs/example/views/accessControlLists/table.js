var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
WindowManager.include(

	'/views/accessControlLists/create',
	'/views/accessControlLists/show',
	'/views/accessControlLists/checkUser',
	'/views/accessControlLists/selectUsers',
	'/views/accessControlLists/updateUsers'
);
exports['Access Control Lists'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white'
	});
	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		color: 'black',
		data: Utils.createRows([
			'Create ACL',
			'Show ACL',
			'Update Users in ACL',
			'Check Permission of ACL'
		])
	});
	table.addEventListener('click', WindowManager.handleOpenWindow);
	win.add(table);
	return win;
};
