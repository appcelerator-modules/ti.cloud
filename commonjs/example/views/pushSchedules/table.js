var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
// Push Schedule is only available to admin user or web admin.
WindowManager.include(

	'/views/pushSchedules/create',
	'/views/pushSchedules/query',
	'/views/pushSchedules/remove'
);

exports['Push Schedules'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white'
	});
	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		color: 'black',
		data: Utils.createRows([
			'Create Push Schedule',
			'Query Push Schedules',
			'Remove Push Schedules'
		])
	});
	table.addEventListener('click', WindowManager.handleOpenWindow);
	win.add(table);
	return win;
};
