const keyboards = require('../keyboards/keyboards.js'),
	user_model = require('../model/user.js');

function stub() {
	let text = 'Извините, я не умею работать с произвольными сообщениями... Выберите одну из категорий, представленных на клавиатуре.';
	let opts = {
		reply_markup: {
			keyboard: keyboards.userKeyboard
		}
	}
	return [text, opts];
}

function doAction() {
	let text = 'Выберите категорию.';
	let opts = {
		reply_markup: {
			keyboard: keyboards.userKeyboard
		}
	}
	return [text, opts];
}

function getSchedule(msg) {
	let text = 'Какое расписание вы бы хотели посмотреть?';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id,
		reply_markup: {
			keyboard: keyboards.scheduleKeyboard
		}
	}
	return [text, opts];
}

async function getSettings(connection, chatId) {
	const user = await user_model.getUser(connection, chatId);
		if (user[0] === undefined) {
			return;
		}
		const userData = await user_model.getUserData(connection, user[0].group_id);
		if (userData[0] === undefined) {
			return;
		}
		let text = `Ваши текущие параметры:\nФакультет: ${userData[0].f_name}\nКурс: ${userData[0].course}\nГруппа: ${userData[0].g_name}\nЧто вы хотите сделать далее?`;
		let opts = {
			chat_id: chatId,
			reply_markup: {
				keyboard: keyboards.userSettingsKeyboard
			}
		}
	return [text, opts];
}

function reReg(first_name) {
	let text = `${first_name}, пожалуйста, пройдите повторную настройку введя команду /start.`;
	return text;
}

function prevChangeSettingsReset(msg) {
	let text = 'Данный диалог настройки был отменен.';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id-1
	}
	return [text, opts];
}

function changeSettings(msg) {
	let text = 'Приступим. Выберите факультет.';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id,
		reply_markup: {
			inline_keyboard: keyboards.facultyChooseKeyboard
		}
	}
	return [text, opts];
}

function chooseFaculty(first_name) {
	let text = `Приветствую, ${first_name}! Укажите свой факультет.`;
	let opts = {
		reply_markup: {
			inline_keyboard: keyboards.facultyChooseKeyboard
		}
	}
	return [text, opts];
}

const chooseCourse = async(connection, msg, facultyAlias) => {
	const chooseCourseKeyboard = await keyboards.getCourseKeyboard(connection, facultyAlias);
	if(chooseCourseKeyboard[0] !== undefined) {
		let text = 'Отлично! Выберите курс.'
		let opts = {
			chat_id: msg.chat.id,
			message_id: msg.message_id,
			reply_markup: {
				inline_keyboard: [chooseCourseKeyboard]
			}
		}
		return [text, opts];
	}
}

const chooseGroup = async(connection, msg, facultyAlias, course) => {
	const chooseGroupKeyboard = await keyboards.getGroupKeyboard(connection, facultyAlias, course);
	if(chooseGroupKeyboard[0] !== undefined) {
		let text = 'Супер! Осталось выбрать группу.';
		let opts = {
			chat_id: msg.chat.id,
			message_id: msg.message_id,
			reply_markup: {
				inline_keyboard: chooseGroupKeyboard
			}
		}
		return [text, opts];
	}
}

function saveQuestion(msg, facultyName, course, group) {
	let text = 'Настройка завершена. Новые параметры:\nФакультет: ' +facultyName+ '\nКурс: ' +course+ '\nГруппа: ' +group+ '\nСохранить установленные параметры?';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id,
		reply_markup: {
			inline_keyboard: keyboards.saveKeyboard
		}
	}
	return [text, opts];
}

function saveSettingsSuccess(msg) {
	let text = 'Отлично! Новые параметры сохранены.';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id
	}
	return [text, opts];
}

function saveSettingsError(msg) {
	let text = 'Упс... Что-то пошло не так. Предлагаю пройти настройку заново';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id,
		reply_markup: {
			inline_keyboard: keyboards.facultyChooseKeyboard
		}
	}
	return [text, opts];
}

function onTodaySchedule(schedule, msg) {
	return [getScheduleMsgText(schedule), getScheduleMsgOpts(msg)];
}

function onTomorrowSchedule(schedule, msg) {
	return [getScheduleMsgText(schedule), getScheduleMsgOpts(msg)];
}

function onCurWeekSchedule(schedule, msg) {
	return [getScheduleMsgText(schedule), getScheduleMsgOpts(msg)];
}

function onNextWeekSchedule(schedule, msg) {
	return [getScheduleMsgText(schedule), getScheduleMsgOpts(msg)];
}

function getScheduleMsgText(schedule) {
	let text = ``;
	let schLength = schedule.length;
	let subject;
	if(schLength != 0) {
		for(let i = 0; i < schLength; i++){
			let subjLength = schedule[i].subjects.length;
			text += `*${schedule[i].day}, ${schedule[i].date}*\n`;
			for(let j = 0; j < subjLength; j++){
				subject = schedule[i].subjects[j];
				text +=  `${subject.time}\n${subject.name}\n${subject.lecturer}\n_${subject.classroom}_\n*${subject.group}*\n-------------------------------\n`;
			}
		}
	} else {
		text = `На данный период пар нет.`;
	}
	return text;
}

function getScheduleMsgOpts(msg) {
	let opts = {
		chat_id: msg.chat.id,
		parse_mode: "Markdown",
		reply_markup: {
			keyboard: keyboards.scheduleKeyboard
		}
	}
	return opts;
}

module.exports = {stub, reReg, doAction, getSchedule, getSettings,
		chooseFaculty, chooseCourse, chooseGroup, 
		saveQuestion, saveSettingsSuccess, saveSettingsError, changeSettings, prevChangeSettingsReset,
		onTodaySchedule, onTomorrowSchedule, onCurWeekSchedule, onNextWeekSchedule}
