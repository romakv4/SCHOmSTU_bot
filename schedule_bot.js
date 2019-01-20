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

	if(currentMsg === '') {
		currentMsg += msg.text;
	} else {
		previousMsg = currentMsg;
	}

	switch(msg.text) {
		case commands.start: {
			facultyAlias = undefined, course = undefined, group = undefined;
			if(currentMsg === previousMsg) {
				bot_actions.prevChangeSettingsReset(msg, function(err, text, opts) {
					if(err) throw err;
					bot.editMessageText(text, opts);
				});
				bot_actions.chooseFaculty(msg.from.first_name, function(err, text, opts) {
					if(err) throw err;
					bot.sendMessage(chatId, text, opts);
				});
			} else {
				try {
					user_model.getUser(connection, chatId).then(user => {
						if (user[0] === undefined) {
							bot_actions.chooseFaculty(msg.from.first_name, function(err, text, opts) {
								if(err) throw err;
								bot.sendMessage(chatId, text, opts);
							})
						} else {
							bot_actions.doAction(function(err, text, opts) {
								if(err) throw err;
								bot.sendMessage(chatId, text, opts);
							});
						}
					});
				} catch(err) {
					console.error('Error: ' + err);
				}
			}
			break;
		}
		case commands.help: {
			bot.sendMessage(chatId, 'Для начала работы с ботом введите команду /start');
			break;
		}
		case commands.viewSchedule: {
			bot_actions.getSchedule(msg, function(err, text, opts) {
				if(err) throw err;
				bot.sendMessage(chatId, text, opts);
			})
			break;
		}
		case commands.onToday: {
			try {
				user_model.getUser(connection, chatId).then(user => {
					if (user[0] === undefined) {
						return;
					}
					try {
						user_model.getUserData(connection, user[0].group_id).then(userData => {
							if (userData[0] === undefined) {
								return;
							}
							let schedule = schedule_getter.getTodaySchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onTodaySchedule(schedule, msg));
						});
					} catch (err) {
						console.error('Error: ' + err);
					}
				});
			} catch (err) {
				console.log('Error: ' + err);
			}
			break;
		}
		case commands.onTomorrow: {
			try {
				user_model.getUser(connection, chatId).then(user => {
					if (user[0] === undefined) {
						return;
					}
					try {
						user_model.getUserData(connection, user[0].group_id).then(userData => {
							if (userData[0] === undefined) {
								return;
							}
							let schedule = schedule_getter.getTomorrowSchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onTomorrowSchedule(schedule, msg));
						});
					} catch (err) {
						console.error('Error: ' + err);
					}
				});
			} catch (err) {
				console.log('Error: ' + err);
			}
			break;
		}
		case commands.onCurrentWeek: {
			try {
				user_model.getUser(connection, chatId).then(user => {
					if (user[0] === undefined) {
						return;
					}
					try {
						user_model.getUserData(connection, user[0].group_id).then(userData => {
							if (userData[0] === undefined) {
								return;
							}
							let schedule = schedule_getter.getCurWeekSchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onCurWeekSchedule(schedule, msg));
						});
					} catch (err) {
						console.error('Error: ' + err);
					}
				});
			} catch (err) {
				console.log('Error: ' + err);
			}
			break;
		}
		case commands.onNextWeek: {
			try {
				user_model.getUser(connection, chatId).then(user => {
					if (user[0] === undefined) {
						return;
					}
					try {
						user_model.getUserData(connection, user[0].group_id).then(userData => {
							if (userData[0] === undefined) {
								return;
							}
							let schedule = schedule_getter.getNextWeekSchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onNextWeekSchedule(schedule, msg));
						});
					} catch (err) {
						console.error('Error: ' + err);
					}
				});
			} catch (err) {
				console.log('Error: ' + err);
			}
			break;
		}
		case commands.back: {
			previousMsg = currentMsg;
			currentMsg = msg.text;
			if(previousMsg === '🛠 Изменение настроек' && currentMsg === '🔙 Назад') {
				userParams = [];
				bot_actions.prevChangeSettingsReset(msg, function(err, text, opts) {
					if(err) throw err;
					bot.editMessageText(text, opts);
				});
			}
			previousMsg = '';
			currentMsg = '';
			bot_actions.doAction(function(err, text, opts) {
				if(err) throw err;
				bot.sendMessage(chatId, text, opts);
			});
			break;
		}
		case commands.settings: {
			try {
				user_model.getUser(connection, chatId).then(user => {
					if (user[0] === undefined) {
						bot_actions.reReg(msg.from.first_name, function(err, text) {
							if(err) throw err;
							bot.sendMessage(chatId, text);
						});
					} else {
						bot_actions.getSettings(connection, chatId).then(msgOpts => {
							bot.sendMessage(chatId, ...msgOpts);
						});
					}
				});
			} catch (err) {
				console.log('Error: ' + err);
			}
			break;
		}
		case commands.changeSettings: {
			facultyAlias = undefined, course = undefined, group = undefined;
			if(currentMsg === previousMsg) {
				bot_actions.prevChangeSettingsReset(msg, function(err, text, opts) {
					if(err) throw err;
					bot.editMessageText(text, opts);
				});
			}
			bot_actions.changeSettings(msg, function(err, text, opts) {
				if(err) throw err;
				bot.sendMessage(chatId, text, opts);
			});
			break;
		}
		default: {
			bot_actions.stub(function(err, text, opts) {
				if(err) throw err;
				previousMsg = currentMsg;
				currentMsg = msg.text;
				if(previousMsg === '🛠 Изменение настроек' && Object.values(commands).indexOf(currentMsg) === -1) {
					bot_actions.prevChangeSettingsReset(msg, function(err, text, opts) {
						if(err) throw err;
						bot.editMessageText(text, opts);
					});
				}
				previousMsg = '';
				currentMsg = '';
				bot.sendMessage(chatId, text, opts);
				})
			break;
		}
	}
});

bot.on('callback_query', function (callbackQuery) {

	const action = callbackQuery.data;
	const msg = callbackQuery.message;

	//user settings

	if(facultyAlias !== undefined && course !== undefined) {
		group = action;
		keyboards.getGroupKeyboard(connection, facultyAlias, course, function(err, chooseGroupKeyboard) {
			if (err) throw err;
			if(chooseGroupKeyboard.some(elem => elem[0].callback_data === action)) {
				settings_model.getGroupId(connection, action, function(err, group_id) {
					if (err) throw err;
					userParams.push(group_id);
					userParams.push(msg.chat.id);
					try {
						user_model.getUserData(connection, user[0].group_id).then(userData => {
							if (userData[0] === undefined) {
								return;
							}
							bot_actions.saveQuestion(msg, userData[0].f_name, course, group, function(err, text, opts) {
								bot.editMessageText(text, opts);
							});
						});
					} catch (err) {
						console.error('Error: ' + err);
					}
				});
			};
		});
	}
	
	if(facultyAlias !== undefined && course === undefined) {
		course = action;
		keyboards.getCourseKeyboard(connection, facultyAlias, function(err, chooseCourseKeyboard) {
			if (err) throw err;
			if(chooseCourseKeyboard.some(elem => elem.callback_data === action)) {
				bot_actions.chooseGroup(connection, msg, facultyAlias, action, function(err, text, opts) {
					if (err) throw err;
					bot.editMessageText(text, opts);
				});	
			};
		});
	}
	
	if(facultyAlias === undefined, course === undefined) {
		facultyAlias = action;
		bot_actions.chooseCourse(connection, msg, action, function(err, text, opts) {
			if (err) throw err;
			bot.editMessageText(text, opts);
		});		
	}

	if(action === 'save') {

		let chatId = msg.chat.id;

		try {
			user_model.getUser(connection, chatId).then(user => {
				if (user[0] === undefined) {
					settings_model.insertUserData(connection, userParams[0], userParams[1], function(err, result) {
						if (err) throw err;
						if(result.affectedRows === 0) {
							userParams = [];
							bot_actions.saveSettingsError(msg, function(err, text, opts) {
								if(err) throw err;
								bot.editMessageText(text, opts);
							});
						}
						userParams = [];
						bot_actions.saveSettingsSuccess(msg, function(err, text, opts) {
							if(err) throw err;
							bot.editMessageText(text, opts);
						});
						bot_actions.doAction(function(err, text, opts) {
							if(err) throw err;
							bot.sendMessage(chatId, text, opts);
						});
					});	
				} else {
					settings_model.updateUserData(connection, userParams[0], userParams[1], function(err, result) {
						if (err) throw err;
						if(result.affectedRows === 0) {
							userParams = [];
							bot_actions.saveSettingsError(msg, function(err, text, opts) {
								if(err) throw err;
								bot.editMessageText(text, opts);
							});
						}
						userParams = [];
						currentMsg = '';
						previousMsg = '';
						bot_actions.saveSettingsSuccess(msg, function(err, text, opts) {
							if(err) throw err;
							bot.editMessageText(text, opts);
						});
						bot_actions.doAction(function(err, text, opts) {
							if(err) throw err;
							bot.sendMessage(chatId, text, opts);
						});
					});
				}
			});
		} catch (err) {
			console.log('Error: ' + err);
		}
	}

	if(action === '!save') {
		facultyAlias = undefined, course = undefined, group = undefined;
		bot_actions.changeSettings(msg, function(err, text, opts) {
			if(err) throw err;
			bot.editMessageText(text, opts);
		});
	}
});