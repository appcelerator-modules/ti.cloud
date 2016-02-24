var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
WindowManager.include(

	'/views/status/create',
	'/views/status/update',
	'/views/status/query',
	'/views/status/remove',
	'/views/status/search',
	'/views/status/show'
);
exports['Status'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white'
	});
	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		color: 'black',
		data: Utils.createRows([
			'Create Status',
			'Query Status',
			'Search Statuses by User'
		])
	});
	table.addEventListener('click', WindowManager.handleOpenWindow);
	win.add(table);
	return win;
};
