const settings_model = require('../model/settings.js');

let facultyChooseFirstRow =
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
let facultyChooseSecondRow =
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
let facultyChooseThirdRow =
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

function getCourseKeyboard(connection, facultyAlias) {
	let courses = settings_model.getCourses(connection, facultyAlias);
	let count = courses.length;
	let courseChooseKeyboard = [];
	for(let i = 0; i < count; i++) {
		courseChooseKeyboard.push({text:courses[i].course, callback_data:String(courses[i].course)});
	}
	return [courseChooseKeyboard];
}

function getGroupKeyboard(connection, facultyAlias, course) {
	let gr = settings_model.getGroups(connection, facultyAlias, course);
	console.log(gr);
	let groupChooseKeyboard = [];
	for (let i = 0; i < gr.length; i++) {
		groupChooseKeyboard.push([{text:gr[i].name, callback_data:gr[i].name}]);
	}
	return groupChooseKeyboard;
}

let saveKeyboard =
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

let userKeyboard =
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

let userSettingsKeyboard =
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

let scheduleKeyboard =
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

module.exports = {facultyChooseFirstRow, facultyChooseSecondRow, facultyChooseThirdRow,
					getCourseKeyboard, getGroupKeyboard, saveKeyboard,
					userKeyboard, userSettingsKeyboard, scheduleKeyboard}
