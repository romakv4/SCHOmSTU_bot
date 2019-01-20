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
				user_model.getUser(connection, chatId, function(err, user) {
					if (err) throw err;
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
			user_model.getUser(connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] !== undefined) {
					user_model.getUserData(connection, user[0].group_id, function(err, userData) {
						if (err) throw err;
						if (userData[0] !== undefined) {
							let schedule = schedule_getter.getTodaySchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onTodaySchedule(schedule, msg));
						}
					});
				}
			});
			break;
		}
		case commands.onTomorrow: {
			user_model.getUser(connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] !== undefined) {
					user_model.getUserData(connection, user[0].group_id, function(err, userData) {
						if (err) throw err;
						if (userData[0] !== undefined) {
							let schedule = schedule_getter.getTomorrowSchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onTomorrowSchedule(schedule, msg));
						}
					});
				}
			});
			break;
		}
		case commands.onCurrentWeek: {
			user_model.getUser(connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] !== undefined) {
					user_model.getUserData(connection, user[0].group_id, function(err, userData) {
						if (err) throw err;
						if (userData[0] !== undefined) {
							let schedule = schedule_getter.getCurWeekSchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onCurWeekSchedule(schedule, msg));
						}
					});
				}
			});
			break;
		}
		case commands.onNextWeek: {
			user_model.getUser(connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] !== undefined) {
					user_model.getUserData(connection, user[0].group_id, function(err, userData) {
						if (err) throw err;
						if (userData[0] !== undefined) {
							let schedule = schedule_getter.getNextWeekSchedule(userData[0].group_oid);
							bot.sendMessage(chatId, ...bot_actions.onNextWeekSchedule(schedule, msg));
						}
					});
				}
			});
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
			user_model.getUser(connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] === undefined) {
					bot_actions.reReg(msg.from.first_name, function(err, text) {
						if(err) throw err;
						bot.sendMessage(chatId, text);
					})
				} else {
					bot_actions.getSettings(connection, chatId, function(err, text, opts) {
						if (err) throw err;
						bot.sendMessage(chatId, text, opts);
					});
				}
			});
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
					user_model.getUserData(connection, group_id, function(err, userData) {
						if (err) throw err;
						if (userData[0] !== undefined) {
							bot_actions.saveQuestion(msg, userData[0].f_name, course, group, function(err, text, opts) {
								bot.editMessageText(text, opts);
							});
						}
					});
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

		user_model.getUser(connection, chatId, function(err, user) {
			if (err) throw err;
			if(user[0] === undefined) {
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
	}

	if(action === '!save') {
		facultyAlias = undefined, course = undefined, group = undefined;
		bot_actions.changeSettings(msg, function(err, text, opts) {
			if(err) throw err;
			bot.editMessageText(text, opts);
		});
	}
});

//Utilite method for debugging. Dont use in the bot.
function strToHex(str) {
	var hexArr = [];
	for (var n = 0, l = str.length; n < l; n ++) {
		var hex = Number(str.charCodeAt(n)).toString(16);
		hexArr.push(hex);
	}
	return hexArr.join('');
}