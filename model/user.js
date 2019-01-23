const promisify = require('util').promisify;

const getUser = async (connection, chatId) => {
	const query = promisify(connection.query).bind(connection);
	const res = await query('SELECT id, group_id, chat_id FROM user WHERE chat_id=' + chatId);
	return res;
}

const getUserData = async(connection, groupId) => {
	const query = promisify(connection.query).bind(connection);
	const res = await query('SELECT f.f_name, g.course, g.g_name, g.group_oid FROM faculty as f JOIN `group` as g ON f.id = g.faculty_id WHERE g.id =' + groupId);
	return res;
}

module.exports = {getUser, getUserData}
