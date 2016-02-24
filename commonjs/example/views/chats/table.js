var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');

WindowManager.include(
	'/views/chats/selectUsersForGroup',
	'/views/chats/showChatGroup',
	'/views/chats/query'
);

exports['Chats'] = function(evt) {
	var win = WindowManager.createWindow({
		backgroundColor: 'white',
		color: 'black'
	});

	var table = Ti.UI.createTableView({
		backgroundColor: '#fff',
		top: 0,
		bottom: 0,
		color : 'black'
	});
	table.addEventListener('click', function(evt) {
		if (evt.row.id) {
			WindowManager.handleOpenWindow({
				target: 'Show Chat Group',
				id: evt.row.id
			});
		} else if (evt.row.title === 'Query Chat Groups') {
			WindowManager.handleOpenWindow({
				target: 'Query Chat Groups'
			});
		} else {
			WindowManager.handleOpenWindow({
				target: 'Select Users for Group'
			});
		}
	});
	win.add(table);

	function refresh() {
		table.setData([{
			title: 'Loading, please wait...',
			color: 'black'
		}]);
		Cloud.Chats.getChatGroups(function(e) {
			if (e.success) {
				var data = [];
				data.push({
					title: 'Query Chat Groups',
					color: 'black'
				});
				data.push({
					title: 'Create New Group!',
					color: 'black'
				});
				for (var i = 0, l = e.chat_groups.length; i < l; i++) {
					var group = e.chat_groups[i];
					var users = '';
					for (var k = 0; k < group.participate_users.length; k++) {
						users += ', ' + group.participate_users[k].first_name + ' ' + group.participate_users[k].last_name;
					}
					data.push(Ti.UI.createTableViewRow({
						title: users.substr(2),
						id: group.id,
						color: 'black'
					}));
				}
				table.setData(data);
			} else {
				Utils.error(e);
			}
		});
	}

	win.addEventListener('open', refresh);
	win.addEventListener('focus', refresh);
	return win;
};
