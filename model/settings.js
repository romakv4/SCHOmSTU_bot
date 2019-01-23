const promisify = require('util').promisify;

const getCourses = async(connection, facultyAlias) => {
	const query = promisify(connection.query).bind(connection);
	const res = await query('SELECT DISTINCT g.course FROM `group` AS g JOIN faculty AS f ON g.faculty_id=f.id WHERE f.alias=\''+facultyAlias+'\'');
	return res;
}

const getGroups = async(connection, facultyAlias, course) => {
	const query = promisify(connection.query).bind(connection);
	const res = await query('SELECT g.g_name FROM `group` as g JOIN faculty as f ON g.faculty_id=f.id WHERE g.course='+course+' AND f.alias=\''+facultyAlias+'\'');
	return res;
}

const getGroupId = async(connection, name) => {
	const query = promisify(connection.query).bind(connection);
	const res = await query('SELECT id FROM `group` WHERE g_name =\'' + name + '\'');
	return res[0].id;
}

const insertUserData = async(connection, groupId, chatId) => {
	const query = promisify(connection.query).bind(connection);
	const res = await query('INSERT INTO `user` (group_id, chat_id) VALUES(' + groupId + ',' + chatId + ')');
	return res;
}

const updateUserData = async(connection, groupId, chatId) => {
	const query = promisify(connection.query).bind(connection);
	const res = await query('UPDATE `user` SET group_id=\'' + groupId + '\' WHERE chat_id='+chatId);
	return res;
}

module.exports = {getCourses, getGroups, getGroupId, insertUserData, updateUserData};
