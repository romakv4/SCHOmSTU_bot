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

let facultyAlias;
let course;
let group;

let editMessageParams;
let userParams = [];

let previousMsg = '';
let currentMsg = '';

bot.on('message', function(msg) {

	let chatId = msg.chat.id;

	switch(msg.text) {
		case commands.start: {
			user_model.getUser(connection, chatId, function(err, user) {
				if (err) throw err;
				if (user[0] === undefined) {
					bot.sendMessage(chatId, ...bot_actions.chooseFaculty());
				} else {
					bot.sendMessage(chatId, ...bot_actions.doAction());
				}
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
				editMessageParams = bot_actions.repeatChangeSettings(msg);
				bot.editMessageText(...editMessageParams);
			}
			previousMsg = '';
			currentMsg = '';
			bot.sendMessage(chatId, ...bot_actions.doAction());
			break;
		}
		case commands.settings: {
			bot_actions.getSettings(connection, chatId, function(err, text, opts) {
				if (err) throw err;
				bot.sendMessage(chatId, text, opts);
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
				facultyAlias = undefined;
				course = undefined;
				group = undefined;
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
							let facultyName = userData[0].f_name;
							editMessageParams = bot_actions.saveQuestion(msg, facultyName, course, group);
							bot.editMessageText(...editMessageParams);
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
	
	if(hasAction(keyboards.facultyChooseFirstRow, action)
	|| hasAction(keyboards.facultyChooseSecondRow, action)
	|| hasAction(keyboards.facultyChooseThirdRow, action)) {
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
					if(result.affectedRows != 0) {
						editMessageParams = bot_actions.saveSettings(true, msg);
						bot.editMessageText(...editMessageParams);
						bot.sendMessage(chatId, ...bot_actions.doAction());
						userParams = [];
					} else {
						editMessageParams = bot_actions.saveSettings(false, msg);
						userParams = [];
						bot.editMessageText(...editMessageParams);
					}
				});				
			} else {
				settings_model.updateUserData(connection, userParams[0], userParams[1], function(err, result) {
					if (err) throw err;
					if(result.affectedRows != 0) {
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
				});
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
