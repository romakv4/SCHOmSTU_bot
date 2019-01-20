function getUser(connection, chatId) {
	return new Promise((resolve, reject) => {
		connection.query('SELECT id, group_id, chat_id FROM user WHERE chat_id=' + chatId, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}

function getUserData(connection, groupId) {
	return new Promise((resolve, reject) => {
		connection.query('SELECT f.f_name, g.course, g.g_name, g.group_oid FROM faculty as f JOIN `group` as g ON f.id = g.faculty_id WHERE g.id =' + groupId, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}

module.exports = {getUser, getUserData}
