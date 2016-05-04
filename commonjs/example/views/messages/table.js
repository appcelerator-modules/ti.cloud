var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
WindowManager.include(

	'/views/messages/create',
	'/views/messages/selectUsers',
	'/views/messages/showInbox',
	'/views/messages/showSent',
	'/views/messages/showThreads',
	'/views/messages/showThreadMessages',
	'/views/messages/show',
	'/views/messages/remove',
	'/views/messages/removeThread',
	'/views/messages/reply'
);
exports['Messages'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white'
	});
	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		color: 'black',
		data: Utils.createRows([
			'Create Message',
			'Show Inbox',
			'Show Sent',
			'Show Threads'
		])
	});
	table.addEventListener('click', WindowManager.handleOpenWindow);
	win.add(table);
	return win;
};
