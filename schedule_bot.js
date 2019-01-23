const TelegramBot = require('node-telegram-bot-api'),
	keyboards = require('./keyboards/keyboards.js'),
	bot_commands = require('./bot/commands.js'),
	bot_actions = require('./bot/actions.js'),
	mysql = require('mysql'),
	schedule_getter = require('./schedule/schedule_getter.js'),
	settings_model = require('./model/settings.js'),
	user_model = require('./model/user.js'),
	config = require('config');

const token = config.get("token");

const connection = mysql.createConnection(config.get("db_config"));

let bot = new TelegramBot(token, {
	polling: true,
	// request: {
	// 	proxy: 'http://localhost:9051'
	// }
});

let commands = bot_commands.commands;

let facultyAlias, course, group;

let userParams = [];

let previousMsg = '', currentMsg = '';

bot.on('message', function(msg) {

	let chatId = msg.chat.id;

	if (currentMsg === '') {
		currentMsg = msg.text;
	} else {
		previousMsg = currentMsg;
		currentMsg = msg.text;
	}

	switch(msg.text) {
		case commands.start: {
			facultyAlias = undefined, course = undefined, group = undefined;
			if (currentMsg === previousMsg) {
				bot.editMessageText(...bot_actions.prevChangeSettingsReset(msg));
				bot.sendMessage(chatId, ...bot_actions.chooseFaculty(msg.from.first_name));
			} else {
				user_model.getUser(connection, chatId).then(user => {
					if (user[0] === undefined) {
						bot.sendMessage(chatId, ...bot_actions.chooseFaculty(msg.from.first_name));
					} else {
						bot.sendMessage(chatId, ...bot_actions.doAction());
					}
				}).catch((err) => console.error('Error: ' + err));
			}
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
			user_model.getUser(connection, chatId).then(user => {
				if (user[0] === undefined) {
					return;
				}
				user_model.getUserData(connection, user[0].group_id).then(userData => {
					if (userData[0] === undefined) {
						return;
					}
					let schedule = schedule_getter.getTodaySchedule(userData[0].group_oid);
					bot.sendMessage(chatId, ...bot_actions.onTodaySchedule(schedule, msg));
				}).catch ((err) => console.error('Error: ' + err));
			}).catch ((err) => console.error('Error: ' + err));
			break;
		}
		case commands.onTomorrow: {
			user_model.getUser(connection, chatId).then(user => {
				if (user[0] === undefined) {
					return;
				}
				user_model.getUserData(connection, user[0].group_id).then(userData => {
					if (userData[0] === undefined) {
						return;
					}
					let schedule = schedule_getter.getTomorrowSchedule(userData[0].group_oid);
					bot.sendMessage(chatId, ...bot_actions.onTomorrowSchedule(schedule, msg));
				}).catch ((err) => console.error('Error: ' + err));
			}).catch ((err) => console.error('Error: ' + err));
			break;
		}
		case commands.onCurrentWeek: {
			user_model.getUser(connection, chatId).then(user => {
				if (user[0] === undefined) {
					return;
				}
				user_model.getUserData(connection, user[0].group_id).then(userData => {
					if (userData[0] === undefined) {
						return;
					}
					let schedule = schedule_getter.getCurWeekSchedule(userData[0].group_oid);
					bot.sendMessage(chatId, ...bot_actions.onCurWeekSchedule(schedule, msg));
				}).catch ((err) => console.error('Error: ' + err));
			}).catch ((err) => console.error('Error: ' + err));
			break;
		}
		case commands.onNextWeek: {
			user_model.getUser(connection, chatId).then(user => {
				if (user[0] === undefined) {
					return;
				}
				user_model.getUserData(connection, user[0].group_id).then(userData => {
					if (userData[0] === undefined) {
						return;
					}
					let schedule = schedule_getter.getNextWeekSchedule(userData[0].group_oid);
					bot.sendMessage(chatId, ...bot_actions.onNextWeekSchedule(schedule, msg));
				}).catch ((err) => console.error('Error: ' + err));
			}).catch ((err) => console.error('Error: ' + err));
			break;
		}
		case commands.back: {
			if (previousMsg === '🛠 Изменение настроек' && currentMsg === '🔙 Назад') {
				userParams = [];
				bot.editMessageText(...bot_actions.prevChangeSettingsReset(msg));
			}
			bot.sendMessage(chatId, ...bot_actions.doAction());
			break;
		}
		case commands.settings: {
			user_model.getUser(connection, chatId).then(user => {
				if (user[0] === undefined) {
					bot.sendMessage(chatId, bot_actions.reReg(msg.from.first_name));
				} else {
					bot_actions.getSettings(connection, chatId).then(msgParams => {
						bot.sendMessage(chatId, ...msgParams);
					}).catch ((err) => console.error('Error: ' + err));
				}
			}).catch ((err) => console.error('Error: ' + err));
			break;
		}
		case commands.changeSettings: {
			facultyAlias = undefined, course = undefined, group = undefined;
			if (currentMsg === previousMsg) {
				bot.editMessageText(...bot_actions.prevChangeSettingsReset(msg));
			}
			bot.sendMessage(chatId, ...bot_actions.changeSettings(msg));
			break;
		}
		default: {
				if (previousMsg === '🛠 Изменение настроек' && Object.values(commands).indexOf(currentMsg) === -1) {
					bot.editMessageText(...bot_actions.prevChangeSettingsReset(msg));
				}
				bot.sendMessage(chatId, ...bot_actions.stub());
			break;
		}
	}
});

bot.on('callback_query', function (callbackQuery) {

	const action = callbackQuery.data;
	const msg = callbackQuery.message;

	//user settings

	if (facultyAlias !== undefined && course !== undefined) {
		group = action;
		keyboards.getGroupKeyboard(connection, facultyAlias, course).then(chooseGroupKeyboard => {
			if (chooseGroupKeyboard.some(elem => elem[0].callback_data === action)) {
				settings_model.getGroupId(connection, action).then(group_id => {
					if(group_id === undefined) {
						return;
					}
					userParams.push(group_id);
					userParams.push(msg.chat.id);
					user_model.getUserData(connection, group_id).then(userData => {
						if (userData[0] === undefined) {
							return;
						}
						bot.editMessageText(...bot_actions.saveQuestion(msg, userData[0].f_name, course, group));
					}).catch ((err) => console.error('Error: ' + err));
				}).catch ((err) => console.error('Error: ' + err));
			}
		}).catch ((err) => console.error('Error: ' + err));
	}
	
	if (facultyAlias !== undefined && course === undefined) {
		course = action;
		keyboards.getCourseKeyboard(connection, facultyAlias).then(chooseCourseKeyboard => {
			if (chooseCourseKeyboard.some(elem => elem.callback_data === action)) {
				bot_actions.chooseGroup(connection, msg, facultyAlias, action).then(msgParams => {
					bot.editMessageText(...msgParams);
				}).catch ((err) => console.error('Error: ' + err));
			}
		}).catch ((err) => console.error(err));
	}
	
	if (facultyAlias === undefined, course === undefined) {
		facultyAlias = action;
		bot_actions.chooseCourse(connection, msg, action).then(msgParams => {
			bot.editMessageText(...msgParams);
		}).catch ((err) => console.error('Error: ' + err));
	}

	if (action === 'save') {

		let chatId = msg.chat.id;

		user_model.getUser(connection, chatId).then(user => {
			if (user[0] === undefined) {
					settings_model.insertUserData(connection, ...userParams).then(result => {
						if (result.affectedRows === 0) {
							userParams = [];
							bot.editMessageText(...bot_actions.saveSettingsError(msg));
						}
						userParams = [];
						bot.editMessageText(...bot_actions.saveSettingsSuccess(msg));
						bot.sendMessage(chatId, ...bot_actions.doAction());
					}).catch ((err) => console.error('Error: ' + err));
			} else {
					settings_model.updateUserData(connection, ...userParams).then(result => {
						if (result.affectedRows === 0) {
							userParams = [];
							bot.editMessageText(...bot_actions.saveSettingsError(msg));
						}
						userParams = [];
						bot.editMessageText(...bot_actions.saveSettingsSuccess(msg));
						bot.sendMessage(chatId, ...bot_actions.doAction());
					}).catch ((err) => console.error('Error: ' + err));
			}
		}).catch ((err) => console.error('Error: ' + err));
	}

	if (action === '!save') {
		facultyAlias = undefined, course = undefined, group = undefined;
		bot.editMessageText(...bot_actions.changeSettings(msg));
	}
});