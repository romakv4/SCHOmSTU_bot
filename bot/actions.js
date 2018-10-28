const keyboards = require('../keyboards/keyboards.js'),
		user_model = require('../model/user');

function stub() {
	let text = 'Извините, я не умею работать с произвольными сообщениями... Выберите одну из категорий, представленных на клавиатуре.';
	let opts = {
		reply_markup: {
			keyboard: keyboards.user_keyboard
		}
	}
	return [text, opts];
}

function doAction() {
	let text = 'Выберите категорию.';
	let opts = {
		reply_markup: {
			keyboard: keyboards.user_keyboard
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
			keyboard: keyboards.schedule_keyboard
		}
	}
	return [text, opts];
}

function chooseFaculty() {
	let text = 'Приветствую! Укажите свой факультет.';
	let opts = {
		reply_markup: {
			inline_keyboard: [keyboards.faculty_choose_frow, keyboards.faculty_choose_srow, keyboards.faculty_choose_trow]
		}
	}
	return [text, opts];
}

function chooseCourse(connection, msg, faculty_pseudo) {
	let text = 'Отлично! Выберите курс.'
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id,
		reply_markup: {
			inline_keyboard: keyboards.getCourseKeyboard(connection, faculty_pseudo)
		}
	}
	return [text, opts];
}

function chooseGroup(connection, msg, faculty_pseudo, course) {
	let text = 'Супер! Осталось выбрать группу.';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id,
		reply_markup: {
			inline_keyboard: keyboards.getGroupKeyboard(connection, faculty_pseudo, course)
		}
	}
	return [text, opts];
}

function saveQuestion(connection, msg, faculty_name, course, group) {
	let text = 'Настройка завершена. Новые параметры:\nФакультет: ' +faculty_name+ '\nКурс: ' +course+ '\nГруппа: ' +group+ '\nСохранить установленные параметры?';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id,
		reply_markup: {
			inline_keyboard: keyboards.save_keyboard
		}
	}
	return [text, opts];
}

function getSettings(connection, msg) {
	let user_group_id = user_model.getUserGroupId(connection, msg);
	let user_faculty_name = user_model.getUserFacultyName(connection, user_group_id);
	let user_group_data = user_model.getUserGroupData(connection, user_group_id);

	let text = `Ваши текущие параметры:\nФакультет: ${user_faculty_name}\nКурс: ${user_group_data.course}\nГруппа: ${user_group_data.name}\nЧто вы хотите сделать далее?`;

	let opts = {
		chat_id: msg.chat.id,
		reply_markup: {
			keyboard: keyboards.user_keyboard_for_settings
		}
	}
	return [text, opts];
}

function saveSettings(success, msg) {
	if(success === true) {
		let text = 'Отлично! Новые параметры сохранены.';
		let opts = {
			chat_id: msg.chat.id,
			message_id: msg.message_id
		}
	return [text, opts];
	} else {
		let text = 'Упс... Что-то пошло не так. Предлагаю пройти настройку заново';
		let opts = {
			chat_id: msg.chat.id,
			message_id: msg.message_id,
			reply_markup: {
				inline_keyboard: [keyboards.faculty_choose_frow, keyboards.faculty_choose_srow, keyboards.faculty_choose_trow]
			}
		}
	return [text, opts];
	}
}

function changeSettings(msg) {
	let text = 'Приступим. Выберите факультет.';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id,
		reply_markup: {
			inline_keyboard: [keyboards.faculty_choose_frow, keyboards.faculty_choose_srow, keyboards.faculty_choose_trow]
		}
	}
	return [text, opts];
}

function repeatChangeSettings(msg) {
	let text = 'Данный диалог настройки был отменен.';
	let opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id-1
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
			keyboard: keyboards.schedule_keyboard
		}
	}
	return opts;
}

module.exports = {stub, doAction, getSchedule, getSettings,
					chooseFaculty, chooseCourse, chooseGroup, saveQuestion, saveSettings, changeSettings, repeatChangeSettings,
					onTodaySchedule, onTomorrowSchedule, onCurWeekSchedule, onNextWeekSchedule};
