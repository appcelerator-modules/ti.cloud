var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
WindowManager.include(

	'/views/photoCollections/create',
	'/views/photoCollections/update',
	'/views/photoCollections/search',
	'/views/photoCollections/remove',
	'/views/photoCollections/show',
	'/views/photoCollections/showSubcollections',
	'/views/photoCollections/showPhotos'
);
exports['Photo Collections'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white'
	});
	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		color: 'black',
		data: Utils.createRows([
			'Create Photo Collection',
			'Search Photo Collections'
		])
	});
	table.addEventListener('click', WindowManager.handleOpenWindow);
	win.add(table);
	return win;
};
