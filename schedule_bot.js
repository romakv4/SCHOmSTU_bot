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

let faculty_pseudo;
let course;
let group;

let edit_message_params;

let isNewUser;
let user_data = [];

let previous_msg = '';
let current_msg = '';

bot.on('message', function(msg) {
	let chat_id = msg.chat.id;
	switch(msg.text) {
		case commands.start: {
			isNewUser = user_model.isNewUser(connection, chat_id);
			if(isNewUser === true) {
				bot.sendMessage(chat_id, ...bot_actions.chooseFaculty());
			} else {
				bot.sendMessage(chat_id, ...bot_actions.doAction());
			}
			break;
		}
		case commands.help: {
			bot.sendMessage(chat_id, 'Для начала работы с ботом введите команду /start');
			break;
		}
		case commands.view_schedule: {
			bot.sendMessage(chat_id, ...bot_actions.getSchedule(msg));
			break;
		}
		case commands.on_today: {
			let groupOid = user_model.getUserGroupOid(connection, msg);
			let schedule = schedule_getter.getTodaySchedule(groupOid);
			bot.sendMessage(chat_id, ...bot_actions.onTodaySchedule(schedule, msg));
			break;
		}
		case commands.on_tomorrow: {
			let groupOid = user_model.getUserGroupOid(connection, msg);
			let schedule = schedule_getter.getTomorrowSchedule(groupOid);
			bot.sendMessage(chat_id, ...bot_actions.onTomorrowSchedule(schedule, msg));
			break;
		}
		case commands.on_current_week: {
			let groupOid = user_model.getUserGroupOid(connection, msg);
			let schedule = schedule_getter.getCurWeekSchedule(groupOid);
			bot.sendMessage(chat_id, ...bot_actions.onCurWeekSchedule(schedule, msg));
			break;
		}
		case commands.on_next_week: {
			let groupOid = user_model.getUserGroupOid(connection, msg);
			let schedule = schedule_getter.getNextWeekSchedule(groupOid);
			bot.sendMessage(chat_id, ...bot_actions.onNextWeekSchedule(schedule, msg));
			break;
		}
		case commands.back: {
			previous_msg = current_msg;
			current_msg = msg.text;
			if(previous_msg === '🛠 Изменение настроек' && current_msg === '🔙 Назад') {
				user_data = [];
				edit_message_params = bot_actions.repeatChangeSettings(msg);
				bot.editMessageText(...edit_message_params);
			}
			previous_msg = '';
			current_msg = '';
			bot.sendMessage(chat_id, ...bot_actions.doAction());
			break;
		}
		case commands.settings: {
			bot.sendMessage(chat_id, ...bot_actions.getSettings(connection, msg));
			break;
		}
		case commands.change_settings: {
			if(current_msg === '') {
				current_msg += msg.text;
			} else {
				previous_msg = current_msg;
			}
			if(current_msg === previous_msg) {
				edit_message_params = bot_actions.repeatChangeSettings(msg);
				bot.editMessageText(...edit_message_params);
			}
			bot.sendMessage(chat_id, ...bot_actions.changeSettings(msg));
			break;
		}
		default: {
			previous_msg = current_msg;
			current_msg = msg.text;
			if(previous_msg === '🛠 Изменение настроек' && Object.values(commands).indexOf(current_msg) === -1) {
				edit_message_params = bot_actions.repeatChangeSettings(msg);
				bot.editMessageText(...edit_message_params);
			}
			previous_msg = '';
			current_msg = '';
			bot.sendMessage(chat_id, ...bot_actions.stub(msg));
			break;
		}
	}
});

bot.on('callback_query', function (callbackQuery) {
	const action = callbackQuery.data;
	const msg = callbackQuery.message;
	//user settings
	if(hasAction(keyboards.faculty_choose_frow, action)
	|| hasAction(keyboards.faculty_choose_srow, action)
	|| hasAction(keyboards.faculty_choose_trow, action)) {
		faculty_pseudo = action;
		edit_message_params = bot_actions.chooseCourse(connection, msg, action);
		bot.editMessageText(...edit_message_params);
	}

	if(faculty_pseudo != undefined && hasAction(keyboards.getCourseKeyboard(connection, faculty_pseudo), action)) {
		course = action;
		edit_message_params = bot_actions.chooseGroup(connection, msg, faculty_pseudo, course);
		bot.editMessageText(...edit_message_params);
	}

	if(faculty_pseudo != undefined && course != undefined && hasAction(keyboards.getGroupKeyboard(connection, faculty_pseudo, course), action)) {
		group = action;
		let group_id = settings_model.getGroupId(connection, action);
		user_data.push(group_id);
		user_data.push(msg.chat.id);
		let faculty_name = user_model.getUserFacultyName(connection, user_data[0]);
		edit_message_params = bot_actions.saveQuestion(connection, msg, faculty_name, course, group);
		bot.editMessageText(...edit_message_params);
	}

	if(action === 'save') {
		let chat_id = msg.chat.id;
		if(isNewUser === true) {
			if(settings_model.insertUserData(connection, ...user_data).affectedRows != 0) {
				edit_message_params = bot_actions.saveSettings(true, msg);
				bot.editMessageText(...edit_message_params);
				bot.sendMessage(chat_id, ...bot_actions.doAction());
				user_data = [];
			} else {
				edit_message_params = bot_actions.saveSettings(false, msg);
				user_data = [];
				bot.editMessageText(...edit_message_params);
			}
		} else {
			if(settings_model.updateUserData(connection, ...user_data).affectedRows != 0) {
				edit_message_params = bot_actions.saveSettings(true, msg);
				bot.editMessageText(...edit_message_params);
				bot.sendMessage(chat_id, ...bot_actions.doAction());
				user_data = [];
				current_msg = '';
				previous_msg = '';
			} else {
				edit_message_params = bot_actions.saveSettings(false, msg);
				user_data = [];
				bot.editMessageText(...edit_message_params);
			}
		}
	}

	if(action === '!save') {
		edit_message_params = bot_actions.changeSettings(msg);
		bot.editMessageText(...edit_message_params);
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
	var hex_arr = [];
	for (var n = 0, l = str.length; n < l; n ++) {
		var hex = Number(str.charCodeAt(n)).toString(16);
		hex_arr.push(hex);
	}
	return hex_arr.join('');
}
