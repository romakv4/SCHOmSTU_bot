const settings_model = require('../model/settings.js');

let faculty_choose_frow =
		[
			{
				text: 'ФГО',
				callback_data: 'fgo'
			},
			{
				text: 'РТФ',
				callback_data: 'rtf'
			},
			{
				text: 'МСИ',
				callback_data: 'msi'
			},
			{
				text: 'НХИ',
				callback_data: 'nhi'
			},
			{
				text: 'ФЭУ',
				callback_data: 'feu'
			},
			{
				text: 'ЭНИ',
				callback_data: 'eni'
			}
		];
let faculty_choose_srow =
		[
			{
				text: 'ФИТиКС',
				callback_data: 'fitiks'
			},
			{
				text: 'ФТНГ',
				callback_data: 'ftng'
			},
			{
				text: 'ФЭиСТ',
				callback_data: 'feist'
			},
			{
				text: 'ФЭОиМ',
				callback_data: 'feoim'
			}
		];
let faculty_choose_trow =
		[
			{
				text: 'Заочного обучения',
				callback_data: 'zaoch'
			},
			{
				text: 'Аспирантура и докторантура',
				callback_data: 'asp_doct'
			}
		];

function getCourseKeyboard(connection, pseudo) {
	let courses = settings_model.getCourses(connection, pseudo);
	let count = courses.length;
	let course_choose_keyboard = [];
	for(let i = 0; i < count; i++) {
		course_choose_keyboard.push({text:courses[i].course, callback_data:String(courses[i].course)});
	}
	return [course_choose_keyboard];
}

function getGroupKeyboard(connection, pseudo, course) {
	let gr = settings_model.getGroups(connection, pseudo, course);
	let group_choose_keyboard = [];
	for (let i = 0; i < gr.length; i++) {
		group_choose_keyboard.push([{text:gr[i].name, callback_data:gr[i].name}]);
	}
	return group_choose_keyboard;
}

let save_keyboard =
	[
		[
			{
				text: '✅ Да, сохранить',
				callback_data: 'save'
			},
			{
				text: '❌ Нет, отредактировать',
				callback_data: '!save'
			}
		]
	];

let user_keyboard =
	[
		[
			{
				text: '📅 Просмотр расписания'
			}
		],
		[
			{
				text: '⚙️ Настройки'
			}
		]
	];

	let user_keyboard_for_settings =
		[
			[
				{
					text: '🛠 Изменение настроек'
				}
			],
			[
				{
					text: '🔙 Назад'
				}
			]
		];

let schedule_keyboard =
	[
		[
			{
				text: 'На сегодня'
			},
			{
				text: 'На завтра'
			}
		],
		[
			{
				text: 'На текущую неделю'
			},
			{
				text: 'На следующую неделю'
			}
		],
		[
			{
				text: '🔙 Назад'
			}
		]
	];

module.exports = {faculty_choose_frow, faculty_choose_srow, faculty_choose_trow,
					getCourseKeyboard, getGroupKeyboard, save_keyboard,
					user_keyboard, user_keyboard_for_settings, schedule_keyboard};
