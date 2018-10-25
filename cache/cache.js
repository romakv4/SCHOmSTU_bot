let schedule_cache = [];

function scheduleCacher(groupOid, type, shcedule_cache, schedule) {
	if(schedule_cache.length === 0) {
		schedule_cache.push({
			groupOid: groupOid,
			type: type,
			add_time: new Date().getTime(),
			schedule: schedule});
	} else {
		if(schedule_cache.some(elem => JSON.stringify(elem.schedule) === JSON.stringify(schedule)) === false) {
			schedule_cache.push({
        groupOid: groupOid,
				type: type,
				add_time: new Date().getTime(),
				schedule: schedule});
		}
	}
}

function getScheduleFromCache(groupOid, type, schedule_cache) {
	let result;
	if(schedule_cache.length === 0) {
		result = null;
	} else {
		schedule_cache.some(elem => {
			if(elem.groupOid === groupOid && elem.type === type) {
				result = elem.schedule;
			} else {
				result = null;
			}
		});
	}
	return result;
}

setInterval(function() {
	schedule_cache = schedule_cache.filter(elem => {
		if((new Date().getTime() - elem.add_time) >= (1000 * 60 * 10)) {
			return false;
		}
		return true;
	});
}, 1000 * 60 * 5);

module.exports = {schedule_cache, scheduleCacher, getScheduleFromCache}
