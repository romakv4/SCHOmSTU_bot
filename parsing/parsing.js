const request = require('sync-request'),
	cheerio = require('cheerio'),
	url = 'https://www.omgtu.ru/students/temp/ajax.php?action=get_schedule';

function getResponse(groupOid, dateFrom, dateTo) {
	const response = request('POST', url, {
		headers: {
			'Content-Type': "application/x-www-form-urlencoded"
		},
		body: 'filter[type]=g&filter[faculty]=&filter[course]=&filter[groupOid]='+groupOid+'&filter[lecturerOid]=&filter[auditoriumOid]=&filter[fromDate]='+dateFrom+'&filter[toDate]='+dateTo
	});

	if(response.statusCode === 200) {
		return response;
	}
	return ['Ошибка'];
}

function getScheduleFromResponse(groupOid, type, dateFrom, dateTo) {
	let response = getResponse(groupOid, dateFrom.format('DD.MM.YYYY'), dateTo.format('DD.MM.YYYY'));
	let $ = cheerio.load(JSON.parse(response.getBody()).html);
	let days = $('table');
	let schedule = [];
	for(let i = 0; i < days.length; i++) {
		let day_date = $(days[i]).children('thead').children('tr').children('td').text().replace(/\n */, ' ');
		let day = day_date.replace(/[0-9,.\s]+/i, '');
		let date = day_date.replace(/[а-яё,\s]+/i, '');
		let pairs = $(days[i]).children('tbody');
		let subjects = [];
		for(let j = 0; j < pairs.length; j++) {
			let time = $(pairs[j]).children('tr').children('td')[0].children[0].data.replace(/\s\s+/g, ' ').trim();
			let subject = $(pairs[j]).children('tr').children('td')[1].children[0].data.replace(/\s\s+/g, ' ').trim();
			let lecturer = $(pairs[j]).children('tr').children('td')[1].children[2].data.replace(/\s\s+/g, ' ').trim();
			let classroom = $(pairs[j]).children('tr').children('td')[1].children[4].data.replace(/\s\s+/g, ' ').trim();
			subjects.push({
				time: time,
				name: subject,
				lecturer: lecturer,
				classroom: classroom
			});
		}
		schedule.push({
			day: day,
			date: date,
			subjects: subjects
		});
	}
	return schedule;
}

module.exports = {getScheduleFromResponse}
