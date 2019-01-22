function getCourses(connection, facultyAlias) {
	return new Promise((resolve, reject) => {
		connection.query('SELECT DISTINCT g.course FROM `group` AS g JOIN faculty AS f ON g.faculty_id=f.id WHERE f.alias=\''+facultyAlias+'\'', (err, res) => {
			if (err) reject(err);
			resolve(res);
		});
	})
}

function getGroups(connection, facultyAlias, course) {
	return new Promise((resolve, reject) => {
		connection.query('SELECT g.g_name FROM `group` as g JOIN faculty as f ON g.faculty_id=f.id WHERE g.course='+course+' AND f.alias=\''+facultyAlias+'\'', (err, res) => {
			if (err) reject(err);
			resolve(res);
		});
	})
}

function getGroupId(connection, name) {
	return new Promise((resolve, reject) => {
		connection.query('SELECT id FROM `group` WHERE g_name =\'' + name + '\'', (err, res) => {
			if (err) reject(err);
			resolve(res[0].id);
		});
	});
}

function insertUserData(connection, groupId, chatId, callback) {
	return new Promise((resolve, reject) => {
		connection.query('INSERT INTO `user` (group_id, chat_id) VALUES(' + groupId + ',' + chatId + ')', (err, res) => {
			if (err) reject(err);
			resolve(res);
		});
	});
}

function updateUserData(connection, groupId, chatId, callback) {
	return new Promise((resolve, reject) => {
		connection.query('UPDATE `user` SET group_id=\'' + groupId + '\' WHERE chat_id='+chatId, (err, res) => {
			if (err) reject(err);
			resolve(res);
		});
	});
}

module.exports = {getCourses, getGroups, getGroupId, insertUserData, updateUserData};
