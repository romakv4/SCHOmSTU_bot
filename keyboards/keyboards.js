const settings_model = require('../model/settings.js');

let facultyChooseKeyboard =
	[
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
		],
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
		],
		[
			{
				text: 'Заочного обучения',
				callback_data: 'zaoch'
			},
			{
				text: 'Аспирантура и докторантура',
				callback_data: 'asp_doct'
			}
		]
	];

function getCourseKeyboard(connection, facultyAlias, callback) {
	settings_model.getCourses(connection, facultyAlias, function(err, courses) {
		if (err) throw err;
		if(courses.length !== 0) {
			let chooseCourseKeyboard = [];
			for(let i = 0; i < courses.length; i++) {
				chooseCourseKeyboard.push({text:courses[i].course, callback_data:String(courses[i].course)});
			}
			callback(null, chooseCourseKeyboard);
		}
	});
}

function getGroupKeyboard(connection, facultyAlias, course, callback) {
	settings_model.getGroups(connection, facultyAlias, course, function(err, groups) {
		if (err) throw err;
		if(groups.length !== 0) {
			let chooseGroupKeyboard = [];
			for (let i = 0; i < groups.length; i++) {
				chooseGroupKeyboard.push([{text:groups[i].g_name, callback_data:groups[i].g_name}]);
			}
			callback(null, chooseGroupKeyboard);
		}
	});
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

module.exports = {facultyChooseKeyboard, getCourseKeyboard, getGroupKeyboard,
					saveKeyboard, userKeyboard, userSettingsKeyboard, scheduleKeyboard}
