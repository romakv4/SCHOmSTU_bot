const TelegramBot = require('node-telegram-bot-api'),
	keyboards = require('./keyboards/keyboards.js'),
	bot_commands = require('./bot/commands.js'),
	bot_actions = require('./bot/actions.js'),
	mysql = require('sync-mysql'),
	async_mysql = require('mysql'),
	schedule_getter = require('./schedule/schedule_getter.js'),
	settings_model = require('./model/settings.js'),
	user_model = require('./model/user.js'),
	config = require('config');

const token = config.get("token");

const connection = new mysql(config.get("db_config"));

let bot = new TelegramBot(token, {
	polling: true,
	// request: {
	// 	proxy: 'http://localhost:9051'
	// }
});

let commands = bot_commands.commands;

let facultyAlias;
let course;
let group;

let editMessageParams;
let userParams = [];

let previousMsg = '';
let currentMsg = '';

bot.on('message', function(msg) {

	const for_async_connection = async_mysql.createConnection(config.get("db_config"));
	let chatId = msg.chat.id;

	switch(msg.text) {
		case commands.start: {
			user_model.getUser(for_async_connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] === undefined) {
					bot.sendMessage(chatId, ...bot_actions.chooseFaculty());
				} else {
					bot.sendMessage(chatId, ...bot_actions.doAction());
				}
				for_async_connection.end();
			});
			break;
		}
		case commands.help: {
			bot.sendMessage(chatId, 'Для начала работы с ботом введите команду /start');
			break;
		}
		case commands.viewSchedule: {
			bot.sendMessage(chatId, ...bot_actions.getSchedule(msg));
			break;
		}
		case commands.onToday: {
			user_model.getUser(for_async_connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] !== undefined) {
					user_model.getUserData(for_async_connection, user[0].group_id, function(err, userData) {
						if (err) throw err;
						if (userData[0] !== undefined) {
							let schedule = schedule_getter.getTodaySchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onTodaySchedule(schedule, msg));
						}
					});
				}
				for_async_connection.end();
			});
			break;
		}
		case commands.onTomorrow: {
			user_model.getUser(for_async_connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] !== undefined) {
					user_model.getUserData(for_async_connection, user[0].group_id, function(err, userData) {
						if (err) throw err;
						if (userData[0] !== undefined) {
							let schedule = schedule_getter.getTomorrowSchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onTomorrowSchedule(schedule, msg));
						}
					});
				}
				for_async_connection.end();
			});
			break;
		}
		case commands.onCurrentWeek: {
			user_model.getUser(for_async_connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] !== undefined) {
					user_model.getUserData(for_async_connection, user[0].group_id, function(err, userData) {
						if (err) throw err;
						if (userData[0] !== undefined) {
							let schedule = schedule_getter.getCurWeekSchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onCurWeekSchedule(schedule, msg));
						}
					});
				}
				for_async_connection.end();
			});
			break;
		}
		case commands.onNextWeek: {
			user_model.getUser(for_async_connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] !== undefined) {
					user_model.getUserData(for_async_connection, user[0].group_id, function(err, userData) {
						if (err) throw err;
						if (userData[0] !== undefined) {
							let schedule = schedule_getter.getNextWeekSchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onNextWeekSchedule(schedule, msg));
						}
					});
				}
				for_async_connection.end();
			});
			break;
		}
		case commands.back: {
			previousMsg = currentMsg;
			currentMsg = msg.text;
			if(previousMsg === '🛠 Изменение настроек' && currentMsg === '🔙 Назад') {
				userParams = [];
				editMessageParams = bot_actions.repeatChangeSettings(msg);
				bot.editMessageText(...editMessageParams);
			}
			previousMsg = '';
			currentMsg = '';
			bot.sendMessage(chatId, ...bot_actions.doAction());
			break;
		}
		case commands.settings: {
			bot_actions.getSettings(for_async_connection, chatId, function(err, text, opts) {
				if (err) throw err;
				bot.sendMessage(chatId, text, opts);
				for_async_connection.end();
			});
			break;
		}
		case commands.changeSettings: {
			if(currentMsg === '') {
				currentMsg += msg.text;
			} else {
				previousMsg = currentMsg;
			}
			if(currentMsg === previousMsg) {
				editMessageParams = bot_actions.repeatChangeSettings(msg);
				bot.editMessageText(...editMessageParams);
			}
			bot.sendMessage(chatId, ...bot_actions.changeSettings(msg));
			break;
		}
		default: {
			previousMsg = currentMsg;
			currentMsg = msg.text;
			if(previousMsg === '🛠 Изменение настроек' && Object.values(commands).indexOf(currentMsg) === -1) {
				editMessageParams = bot_actions.repeatChangeSettings(msg);
				bot.editMessageText(...editMessageParams);
			}
			previousMsg = '';
			currentMsg = '';
			bot.sendMessage(chatId, ...bot_actions.stub(msg));
			break;
		}
	}
});

bot.on('callback_query', function (callbackQuery) {
	
	const for_async_connection = async_mysql.createConnection(config.get("db_config"));

	const action = callbackQuery.data;
	const msg = callbackQuery.message;

	//user settings
	if(hasAction(keyboards.facultyChooseFirstRow, action)
	|| hasAction(keyboards.facultyChooseSecondRow, action)
	|| hasAction(keyboards.facultyChooseThirdRow, action)) {
		facultyAlias = action;
		editMessageParams = bot_actions.chooseCourse(connection, msg, action);
		bot.editMessageText(...editMessageParams);
	}

	if(facultyAlias != undefined && hasAction(keyboards.getCourseKeyboard(connection, facultyAlias), action)) {
		course = action;
		editMessageParams = bot_actions.chooseGroup(connection, msg, facultyAlias, course);
		bot.editMessageText(...editMessageParams);
	}

	if(facultyAlias != undefined && course != undefined && hasAction(keyboards.getGroupKeyboard(connection, facultyAlias, course), action)) {
		group = action;
		settings_model.getGroupId(for_async_connection, action, function(err, group_id) {
			if (err) throw err;
			userParams.push(group_id);
			userParams.push(msg.chat.id);
			user_model.getUserData(for_async_connection, group_id, function(err, userData) {
				if (err) throw err;
				if (userData[0] !== undefined) {
					let facultyName = userData[0].f_name;
					editMessageParams = bot_actions.saveQuestion(msg, facultyName, course, group);
					bot.editMessageText(...editMessageParams);
				}
			});
		});
	}

	if(action === 'save') {

		let chatId = msg.chat.id;

		user_model.getUser(for_async_connection, chatId, function(err, user) {
			if (err) throw err;
			if(user[0] === undefined) {
				if(settings_model.insertUserData(connection, ...userParams).affectedRows != 0) {
					editMessageParams = bot_actions.saveSettings(true, msg);
					bot.editMessageText(...editMessageParams);
					bot.sendMessage(chatId, ...bot_actions.doAction());
					userParams = [];
				} else {
					editMessageParams = bot_actions.saveSettings(false, msg);
					userParams = [];
					bot.editMessageText(...editMessageParams);
				}
			} else {
				if(settings_model.updateUserData(connection, ...userParams).affectedRows != 0) {
					editMessageParams = bot_actions.saveSettings(true, msg);
					bot.editMessageText(...editMessageParams);
					bot.sendMessage(chatId, ...bot_actions.doAction());
					userParams = [];
					currentMsg = '';
					previousMsg = '';
				} else {
					editMessageParams = bot_actions.saveSettings(false, msg);
					userParams = [];
					bot.editMessageText(...editMessageParams);
				}
			}
		});
	}

	if(action === '!save') {
		editMessageParams = bot_actions.changeSettings(msg);
		bot.editMessageText(...editMessageParams);
	}
});

function hasAction(array, action) {
	if(array.length != 1 && array[0].length === undefined) {
		return array.some(elem => elem.callback_data === action);
	} else if(array.length != 1 && array[0].length != undefined) {
		return array.some(elem => elem[0].callback_data === action);
	} else if(array.length === 1 && array[0].length != undefined) {
		return array[0].some(elem => elem.callback_data === action);
	}
}

//Utilite method for debugging. Dont use in the bot.
function strToHex(str) {
	var hexArr = [];
	for (var n = 0, l = str.length; n < l; n ++) {
		var hex = Number(str.charCodeAt(n)).toString(16);
		hexArr.push(hex);
	}
	return hexArr.join('');
}
