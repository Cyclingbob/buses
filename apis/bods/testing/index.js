const parse = require("../parseTimetable")
const path = require("path")

var content = parse(path.join(__dirname, "../timetable.json"))
var services = content.services

var first825journey = services[0].lines[1].vehicle_journeys[0]

var [ depHour, depMins, depSeconds ] = first825journey.departure_time.split(':')

var countHour = parseInt(depHour)
var countMins = parseInt(depMins)
var countSeconds = parseInt(depSeconds)

var stops = []

function addTime(hour1, minute1, second1, hour2, minute2, second2){
    var hours = hour1 + hour2
    var minutes = minute1 + minute2
    var seconds = second1 + second2

    if(seconds >= 60){
        minutes += Math.floor(seconds / 60)
        seconds %= 60
    }

    if(minutes >= 60){
        hours += Math.floor(minutes / 60)
        minutes %= 60
    }

    return { hours, minutes, seconds }
}

first825journey.journey_timing_links.forEach((link, i) => {
    if(i == 0){
        stops.push({ time: depHour + ":" + depMins, atco_code: link.timing_link.route_link.from_atco_code })
    } else { //last item

        let newTime = addTime(countHour, countHour, countSeconds, 0, link.time.minutes, link.time.seconds)

        stops.push({ time: newTime, atco_code: link.timing_link.route_link.to_atco_code })
    }
})

stops = stops.map(stop => {
    var found = content.content.stopPoints.find(a => a.atco_code === stop.atco_code)
    return {
        time: stop.time,
        atco_code: stop.atco_code,
        name: found.common_name
    }
})

console.log(stops)

// console.log(services[0].lines[1].vehicle_journeys[0].journey_timing_links)