var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
WindowManager.include(

	'/views/friends/add',
	'/views/friends/approve',
	'/views/friends/searchUsers',
	'/views/friends/search',
	'/views/friends/remove'
);
exports['Friends'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white'
	});
	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		color: 'black',
		data: Utils.createRows([
			'Add Friends',
			'Approve Friends',
			'Search Friends',
			'Remove Friends'
		])
	});
	table.addEventListener('click', WindowManager.handleOpenWindow);
	win.add(table);
	return win;
};
