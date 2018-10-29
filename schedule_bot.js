const	TelegramBot = require('node-telegram-bot-api'),
	keyboards = require('./keyboards/keyboards.js'),
	bot_commands = require('./bot/commands.js'),
	bot_actions = require('./bot/actions.js'),
	mysql = require('sync-mysql'),
	schedule_getter = require('./schedule/schedule_getter.js'),
	settings_model = require('./model/settings.js'),
	user_model = require('./model/user.js'),
	config = require('config');

const token = config.get("token");

const connection = new mysql(config.get("db_config"));

let bot = new TelegramBot(token, {
	polling: true,
	request: {
		proxy: 'http://localhost:9051'
	}
});

let commands = bot_commands.commands;

let facultyAlias;
let course;
let group;

let editMessageParams;

let isNewUser;
let userData = [];

let previousMsg = '';
let currentMsg = '';

bot.on('message', function(msg) {
	let chatId = msg.chat.id;
	switch(msg.text) {
		case commands.start: {
			isNewUser = user_model.isNewUser(connection, chatId);
			if(isNewUser === true) {
				bot.sendMessage(chatId, ...bot_actions.chooseFaculty());
			} else {
				bot.sendMessage(chatId, ...bot_actions.doAction());
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
			let groupOid = user_model.getUserGroupOid(connection, msg);
			let schedule = schedule_getter.getTodaySchedule(groupOid);
			bot.sendMessage(chatId, ...bot_actions.onTodaySchedule(schedule, msg));
			break;
		}
		case commands.onTomorrow: {
			let groupOid = user_model.getUserGroupOid(connection, msg);
			let schedule = schedule_getter.getTomorrowSchedule(groupOid);
			bot.sendMessage(chatId, ...bot_actions.onTomorrowSchedule(schedule, msg));
			break;
		}
		case commands.onCurrentWeek: {
			let groupOid = user_model.getUserGroupOid(connection, msg);
			let schedule = schedule_getter.getCurWeekSchedule(groupOid);
			bot.sendMessage(chatId, ...bot_actions.onCurWeekSchedule(schedule, msg));
			break;
		}
		case commands.onNextWeek: {
			let groupOid = user_model.getUserGroupOid(connection, msg);
			let schedule = schedule_getter.getNextWeekSchedule(groupOid);
			bot.sendMessage(chatId, ...bot_actions.onNextWeekSchedule(schedule, msg));
			break;
		}
		case commands.back: {
			previousMsg = currentMsg;
			currentMsg = msg.text;
			if(previousMsg === '🛠 Изменение настроек' && currentMsg === '🔙 Назад') {
				userData = [];
				editMessageParams = bot_actions.repeatChangeSettings(msg);
				bot.editMessageText(...editMessageParams);
			}
			previousMsg = '';
			currentMsg = '';
			bot.sendMessage(chatId, ...bot_actions.doAction());
			break;
		}
		case commands.settings: {
			bot.sendMessage(chatId, ...bot_actions.getSettings(connection, msg));
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
		let group_id = settings_model.getGroupId(connection, action);
		userData.push(group_id);
		userData.push(msg.chat.id);
		let facultyName = user_model.getUserFacultyName(connection, userData[0]);
		editMessageParams = bot_actions.saveQuestion(connection, msg, facultyName, course, group);
		bot.editMessageText(...editMessageParams);
	}

	if(action === 'save') {
		let chatId = msg.chat.id;
		if(isNewUser === true) {
			if(settings_model.insertUserData(connection, ...userData).affectedRows != 0) {
				editMessageParams = bot_actions.saveSettings(true, msg);
				bot.editMessageText(...editMessageParams);
				bot.sendMessage(chatId, ...bot_actions.doAction());
				userData = [];
			} else {
				editMessageParams = bot_actions.saveSettings(false, msg);
				userData = [];
				bot.editMessageText(...editMessageParams);
			}
		} else {
			if(settings_model.updateUserData(connection, ...userData).affectedRows != 0) {
				editMessageParams = bot_actions.saveSettings(true, msg);
				bot.editMessageText(...editMessageParams);
				bot.sendMessage(chatId, ...bot_actions.doAction());
				userData = [];
				currentMsg = '';
				previousMsg = '';
			} else {
				editMessageParams = bot_actions.saveSettings(false, msg);
				userData = [];
				bot.editMessageText(...editMessageParams);
			}
		}
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
