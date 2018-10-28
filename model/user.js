function isNewUser(connection, chat_id) {
	return (connection.query('SELECT * FROM user WHERE chat_id=' + chat_id)[0] === undefined);
}

function getUserGroupId(connection, msg) {
	return connection.query('SELECT group_id FROM user WHERE chat_id =' + msg.chat.id)[0].group_id;
}

function getUserFacultyName(connection, groupId) {
	return connection.query('SELECT f.name FROM faculty as f JOIN group_list as gl ON f.id = gl.faculty_id WHERE gl.id =' + groupId)[0].name;
}

function getUserGroupData(connection, groupId) {
	return connection.query('SELECT course, name FROM group_list WHERE id =' + groupId)[0];
}

function getUserGroupOid(connection, msg) {
	return connection.query('SELECT gl.groupOid FROM group_list as gl JOIN user as u ON gl.id = u.group_id WHERE u.chat_id =' + msg.chat.id)[0].groupOid;
}

module.exports = {isNewUser, getUserGroupId, getUserFacultyName, getUserGroupData, getUserGroupOid}
