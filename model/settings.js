function getCourses(connection, pseudo) {
	return connection.query('SELECT DISTINCT gl.course FROM group_list AS gl JOIN faculty AS f ON gl.faculty_id=f.id WHERE f.pseudo=\''+pseudo+'\'');
}

function getGroups(connection, pseudo, course) {
	return connection.query('SELECT gl.name FROM group_list as gl JOIN faculty as f ON gl.faculty_id=f.id WHERE gl.course='+course+' AND f.pseudo=\''+pseudo+'\'');
}

function getGroupId(connection, name) {
	return connection.query('SELECT id FROM group_list WHERE name =\'' + name + '\'')[0].id;
}

function insertUserData(connection, groupId, chatId) {
	return connection.query('INSERT INTO `user` (group_id, chat_id) VALUES(' + groupId + ',' + chatId + ')');
}

function updateUserData(connection, groupId, chatId) {
	return connection.query('UPDATE `user` SET group_id=\'' + groupId + '\' WHERE chat_id='+chatId);
}

module.exports = {getCourses, getGroups, getGroupId, insertUserData, updateUserData};
