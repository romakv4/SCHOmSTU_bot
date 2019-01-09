function getCourses(connection, facultyAlias) {
	return connection.query('SELECT DISTINCT g.course FROM `group` AS g JOIN faculty AS f ON g.faculty_id=f.id WHERE f.alias=\''+facultyAlias+'\'');
}

function getGroups(connection, facultyAlias, course) {
	return connection.query('SELECT g.g_name FROM `group` as g JOIN faculty as f ON g.faculty_id=f.id WHERE g.course='+course+' AND f.alias=\''+facultyAlias+'\'');
}

function getGroupId(connection, name) {
	return connection.query('SELECT id FROM `group` WHERE g_name =\'' + name + '\'')[0].id;
}

function insertUserData(connection, groupId, chatId) {
	return connection.query('INSERT INTO `user` (group_id, chat_id) VALUES(' + groupId + ',' + chatId + ')');
}

function updateUserData(connection, groupId, chatId) {
	return connection.query('UPDATE `user` SET group_id=\'' + groupId + '\' WHERE chat_id='+chatId);
}

module.exports = {getCourses, getGroups, getGroupId, insertUserData, updateUserData};
