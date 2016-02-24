/*
 * We'll follow a really simple paradigm in this example app. It's going to be a hierarchy of tables where you can drill
 * in to individual examples for each ACS namespace.
 *
 * To facilitate that, we will have a collection of "Window Functions" like the "Users" window, and the "Login" window.
 *
 * These are defined in the "windows" folder and its children.
 *
 * That's it! Enjoy.
 */
var Cloud = require('ti.cloud');
var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
Cloud.debug = true;

// Include the window hierarchy.
WindowManager.include(
	'/views/chats/table',
	'/views/checkins/table',
	'/views/clients/table',
	'/views/customObjects/table',
	'/views/emails/table',
	'/views/events/table',
	'/views/files/table',
	'/views/friends/table',
	'/views/geoFences/table',
	'/views/photoCollections/table',
	'/views/photos/table',
	'/views/places/table',
	'/views/posts/table',
	'/views/keyValues/table',
	'/views/likes/table',
	'/views/messages/table',
	'/views/pushNotifications/table',
	'/views/pushSchedules/table',
	'/views/reviews/table',
	'/views/social/table',
	'/views/status/table',
	'/views/users/table',
	'/views/accessControlLists/table',
	'/views/genericSendRequest'
);

// Define our main window.
var table = Ti.UI.createTableView({
	backgroundColor: '#fff',
	data: Utils.createRows([
		'Users',
		'Access Control Lists',
		'Chats',
		'Checkins',
		'Clients',
		'Custom Objects',
		'Emails',
		'Events',
		'Files',
		'Friends',
		'GeoFences',
		'Key Values',
		'Likes',
		'Messages',
		'Photo Collections',
		'Photos',
		'Places',
		'Posts',
		'Push Notifications',
		'Push Schedules',
		'Reviews',
		'Social',
		'Status',
		'Generic Send Request'
	])
});
table.addEventListener('click', WindowManager.handleOpenWindow);
var win = WindowManager.createInitialWindow('ti.cloud demo', table);
win.open();