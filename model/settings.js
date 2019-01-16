function getCourses(connection, facultyAlias, callback) {
	connection.query('SELECT DISTINCT g.course FROM `group` AS g JOIN faculty AS f ON g.faculty_id=f.id WHERE f.alias=\''+facultyAlias+'\'', function(err, res) {
		if (err) callback(err, null);
		callback(null, res);
	});
}

function getGroups(connection, facultyAlias, course, callback) {
	connection.query('SELECT g.g_name FROM `group` as g JOIN faculty as f ON g.faculty_id=f.id WHERE g.course='+course+' AND f.alias=\''+facultyAlias+'\'', function(err, res) {
		if (err) callback(err, null);
		callback(null, res);
	});
}

function getGroupId(connection, name, callback) {
	connection.query('SELECT id FROM `group` WHERE g_name =\'' + name + '\'', function(err, res) {
		if (err) callback(err, null);
		callback(null, res[0].id);
	});
}

function insertUserData(connection, groupId, chatId, callback) {
	connection.query('INSERT INTO `user` (group_id, chat_id) VALUES(' + groupId + ',' + chatId + ')', function(err, res) {
		if (err) callback(err, null);
		callback(null, res);
	});
}

function updateUserData(connection, groupId, chatId, callback) {
	connection.query('UPDATE `user` SET group_id=\'' + groupId + '\' WHERE chat_id='+chatId, function(err, res) {
		if (err) callback(err, null);
		callback(null, res);
	});
}

module.exports = {getCourses, getGroups, getGroupId, insertUserData, updateUserData};
