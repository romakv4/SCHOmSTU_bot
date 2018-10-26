function getCourses(connection, pseudo) {
	return connection.query('SELECT DISTINCT gl.course FROM group_list AS gl JOIN faculty AS f ON gl.faculty_id=f.id WHERE f.pseudo=\''+pseudo+'\'');
}

function getGroups(connection, pseudo, course) {
	return connection.query('SELECT gl.name FROM group_list as gl JOIN faculty as f ON gl.faculty_id=f.id WHERE gl.course='+course+' AND f.pseudo=\''+pseudo+'\'');
}

function getFacultyId(connection, pseudo) {
	return connection.query('SELECT id FROM faculty WHERE pseudo =\'' + pseudo + '\'')[0].id;
}

function getGroupId(connection, name) {
	return connection.query('SELECT id FROM group_list WHERE name =\'' + name + '\'')[0].id;
}

function insertUserData(connection, faculty_id, group_id, chat_id) {
	return connection.query('INSERT INTO `user` (faculty_id, group_id, chat_id) VALUES(' + faculty_id + ',' + group_id + ',' + chat_id + ')');
}

function updateUserData(connection, faculty_id, group_id, chat_id) {
	return connection.query('UPDATE user SET faculty_id=\'' + faculty_id + '\', group_id=\'' + group_id + '\' WHERE chat_id='+chat_id);
}

module.exports = {getCourses, getGroups, getFacultyId, getGroupId, insertUserData, updateUserData};
