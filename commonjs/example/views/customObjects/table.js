var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
WindowManager.include(

	'/views/customObjects/create',
	'/views/customObjects/query',
	'/views/customObjects/remove',
	'/views/customObjects/update'
);
exports['Custom Objects'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white'
	});
	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		color: 'black',
		data: Utils.createRows([
			'Create Object',
			'Query Objects'
		])
	});
	table.addEventListener('click', WindowManager.handleOpenWindow);
	win.add(table);
	return win;
};
