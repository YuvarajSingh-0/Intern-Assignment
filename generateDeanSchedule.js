const moment = require('moment');

function generateDeanSchedule(deanId) {
    const schedule = [];
    const today = moment();

    // Find the next Thursday at 10 AM
    let startDate = today.clone().startOf('isoWeek').add(3, 'days').set({ hour: 10, minute: 0, second: 0, millisecond: 0 });

    // Generate slots for the current week and next week
    for (let i = 0; i < 4; i++) { // Two slots per week for 4 weeks
        let endTime = startDate.clone().add(1, 'hour');
        schedule.push({ deanId, startTime: startDate.toDate(), endTime: endTime.toDate(), bookedStudent: null });
        startDate.add(1, 'day'); // Move to the next day
        endTime = startDate.clone().add(1, 'hour');
        schedule.push({ deanId, startTime: startDate.toDate(), endTime: endTime.toDate(), bookedStudent: null });
        if (startDate.day() === 5) { // If it's Friday, move to the next Thursday
            startDate.add(6, 'days');
        }
    }

    console.log(schedule);
    return schedule;
}

module.exports = generateDeanSchedule;
