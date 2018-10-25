function getCourses(connection, pseudo) {
	return connection.query('SELECT DISTINCT gl.course FROM group_list AS gl JOIN faculty AS f ON gl.faculty_id=f.id WHERE f.pseudo=\''+pseudo+'\'');
}

function getGroups(connection, pseudo, course) {
	return connection.query('SELECT gl.name FROM group_list as gl JOIN faculty as f ON gl.faculty_id=f.id WHERE gl.course='+course+' AND f.pseudo=\''+pseudo+'\'');
}

function insertUserData(connection, chat_id, pseudo, course, group) {
	return connection.query('INSERT INTO `user` (chat_id, faculty, course, ugroup) VALUES('+chat_id+',\''+pseudo+'\','+course+',\''+group+'\')');
}

function updateUserData(connection, chat_id, pseudo, course, group) {
	return connection.query('UPDATE user SET faculty=\''+pseudo+'\', course='+course+',ugroup=\''+group+'\' WHERE chat_id='+chat_id);
}

module.exports = {getCourses, getGroups, insertUserData, updateUserData};