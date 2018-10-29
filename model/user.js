function isNewUser(connection, chat_id) {
	return (connection.query('SELECT * FROM user WHERE chat_id=' + chat_id)[0] === undefined);
}

function getUserGroupId(connection, msg) {
	return connection.query('SELECT group_id FROM user WHERE chat_id =' + msg.chat.id)[0].group_id;
}

function getUserFacultyName(connection, groupId) {
	return connection.query('SELECT f.name FROM faculty as f JOIN `group` as g ON f.id = g.faculty_id WHERE g.id =' + groupId)[0].name;
}

function getUserGroupData(connection, groupId) {
	return connection.query('SELECT course, name FROM `group` WHERE id =' + groupId)[0];
}

function getUserGroupOid(connection, msg) {
	return connection.query('SELECT g.group_oid FROM `group` as g JOIN user as u ON g.id = u.group_id WHERE u.chat_id =' + msg.chat.id)[0].group_oid;
}

module.exports = {isNewUser, getUserGroupId, getUserFacultyName, getUserGroupData, getUserGroupOid}
