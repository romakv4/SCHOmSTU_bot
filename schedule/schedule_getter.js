const parsing = require('../parsing/parsing.js'),
  moment = require('moment'),
  cacher = require('../cache/cache.js');

function getTodaySchedule(groupOid) {
	let type = 'on_today';
	let today = moment();
	let tomorrow = moment().add(1, 'days');
	let schedule = cacher.getScheduleFromCache(groupOid, type, cacher.schedule_cache);
	if (schedule === null) {
		schedule = parsing.getScheduleFromResponse(groupOid, type, today, tomorrow);
    cacher.scheduleCacher(groupOid, type, cacher.schedule_cache, schedule);
	}
	return schedule;
}

function getTomorrowSchedule(groupOid) {
	let type = 'on_tomorrow';
	let tomorrow = moment().add(1, 'days');
	let afterTomorrow = moment().add(2, 'days');
	let schedule = cacher.getScheduleFromCache(groupOid, type, cacher.schedule_cache);
	if (schedule === null) {
		schedule = parsing.getScheduleFromResponse(groupOid, type, tomorrow, afterTomorrow);
    cacher.scheduleCacher(groupOid, type, cacher.schedule_cache, schedule);
	}
	return schedule;
}

function getCurWeekSchedule(groupOid) {
	let type = 'on_current_week';
	let today = moment();
	let weekStart;
	let weekEnd;
	if(today.format('dddd') === 'Sunday') {
		weekStart = moment().subtract(6, 'days');
		weekEnd = moment();
	} else {
		weekStart = moment().startOf('week').add(1, 'days');
		weekEnd = moment().endOf('week').add(1, 'days');
	}
	let schedule = cacher.getScheduleFromCache(groupOid, type, cacher.schedule_cache);
	if (schedule === null) {
		schedule = parsing.getScheduleFromResponse(groupOid, type, weekStart, weekEnd);
    cacher.scheduleCacher(groupOid, type, cacher.schedule_cache, schedule);
	}
	return schedule;
}

function getNextWeekSchedule(groupOid) {
	let type = 'on_next_week';
	let today = moment();
	let weekStart;
	let weekEnd;
	if(today.format('dddd') === 'Sunday') {
		weekStart = moment().add(1, 'days');
		weekEnd = moment().add(7, 'days');
	}	else {
		weekStart = moment().endOf('week').add(2,'days');
		weekEnd = moment().endOf('week').add(8,'days');
	}
	let schedule = cacher.getScheduleFromCache(groupOid, type, cacher.schedule_cache);
	if (schedule === null) {
		schedule = parsing.getScheduleFromResponse(groupOid, type, weekStart, weekEnd);
    cacher.scheduleCacher(groupOid, type, cacher.schedule_cache, schedule);
	}
	return schedule;
}

module.exports = {getTodaySchedule, getTomorrowSchedule, getCurWeekSchedule, getNextWeekSchedule};
