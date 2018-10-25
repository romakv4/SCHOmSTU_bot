function isNewUser(connection, chat_id) {
	return (connection.query('SELECT * FROM user WHERE chat_id='+chat_id)[0] === undefined);
}

function getUserData(connection, msg) {
	return connection.query('SELECT faculty, course, ugroup FROM user WHERE chat_id ='+msg.chat.id)[0];
}

function getUserFacultyName(connection, pseudo) {
	return connection.query('SELECT name FROM faculty WHERE pseudo=\''+pseudo+'\'')[0].name;
}

function getUserGroupOid(connection, msg) {
	let group = connection.query('SELECT ugroup FROM user WHERE chat_id ='+msg.chat.id)[0].ugroup;
	return connection.query('SELECT groupOid FROM group_list WHERE name =\''+group+'\'')[0].groupOid;
}

module.exports = {isNewUser, getUserData, getUserFacultyName, getUserGroupOid}