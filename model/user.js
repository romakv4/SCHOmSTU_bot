function isNewUser(connection, chat_id) {
	return (connection.query('SELECT * FROM user WHERE chat_id=' + chat_id)[0] === undefined);
}

function getUserData(connection, msg) {
	return connection.query('SELECT faculty_id, group_id FROM user WHERE chat_id =' + msg.chat.id)[0];
}

function getUserFacultyName(connection, faculty_id) {
	return connection.query('SELECT name FROM faculty WHERE id=\'' + faculty_id + '\'')[0].name;
}

function getUserGroupData(connection, group_id) {
	return connection.query('SELECT course, name FROM group_list WHERE id =' + group_id)[0];
}

function getUserGroupOid(connection, msg) {
	let group_id = connection.query('SELECT group_id FROM user WHERE chat_id =' + msg.chat.id)[0].group_id;
	return connection.query('SELECT groupOid FROM group_list WHERE id =' + group_id)[0].groupOid;
}

module.exports = {isNewUser, getUserData, getUserFacultyName, getUserGroupData, getUserGroupOid}
