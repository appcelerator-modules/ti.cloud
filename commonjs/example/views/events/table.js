var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
WindowManager.include(

	'/views/events/create',
	'/views/events/show',
	'/views/events/showOccurrences',
	'/views/events/query',
	'/views/events/queryOccurrences',
	'/views/events/update',
	'/views/events/remove'
);
exports['Events'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white'
	});
	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		color: 'black',
		data: Utils.createRows([
			'Create Event',
			'Query Events',
			'Query Event Occurrences'
		])
	});
	table.addEventListener('click', WindowManager.handleOpenWindow);
	win.add(table);
	return win;
};
