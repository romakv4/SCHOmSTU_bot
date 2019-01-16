function getUser(connection, chatId, callback) {
	connection.query('SELECT id, group_id, chat_id FROM user WHERE chat_id=' + chatId, function(err, res) {
		if (err) callback(err, null);
		callback(null, res);
	});
}

function getUserData(connection, groupId, callback) {
	connection.query('SELECT f.f_name, g.course, g.g_name, g.group_oid FROM faculty as f JOIN `group` as g ON f.id = g.faculty_id WHERE g.id =' + groupId, function(err, res) {
		if (err) callback(err, null);
		callback(null, res);
	});
}

module.exports = {getUser, getUserData}
