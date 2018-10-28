let scheduleCache = [];

function scheduleCacher(groupOid, type, scheduleCache, schedule) {
	if(scheduleCache.length === 0) {
		scheduleCache.push({
			groupOid: groupOid,
			type: type,
			add_time: new Date().getTime(),
			schedule: schedule});
	} else {
		if(scheduleCache.some(elem => JSON.stringify(elem.schedule) === JSON.stringify(schedule)) === false) {
			scheduleCache.push({
        groupOid: groupOid,
				type: type,
				add_time: new Date().getTime(),
				schedule: schedule});
		}
	}
}

function getScheduleFromCache(groupOid, type, scheduleCache) {
	let result;
	if(scheduleCache.length === 0) {
		result = null;
	} else {
		scheduleCache.some(elem => {
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
	scheduleCache = scheduleCache.filter(elem => {
		if((new Date().getTime() - elem.add_time) >= (1000 * 60 * 10)) {
			return false;
		}
		return true;
	});
}, 1000 * 60 * 5);

module.exports = {scheduleCache, scheduleCacher, getScheduleFromCache}
