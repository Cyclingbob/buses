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

    var d = new Date()
    d.setHours(hour1 + hour2)
    d.setMinutes(minute1 + minute2)
    d.setSeconds(second1 + second2)

    return {
        hours: d.getHours(),
        minutes: d.getMinutes(),
        seconds: d.getSeconds()
    }
}

first825journey.journey_timing_links.forEach((link, i) => {
    // console.log(content.content.stopPoints.find(a => a.atco_code === link.timing_link.route_link.from_atco_code))
    if(i == 0){
        stops.push({ time: { hours: countHour, minutes: countMins, seconds: countSeconds }, atco_code: link.timing_link.route_link.from_atco_code })
    }

    let newTime = addTime(countHour, countMins, countSeconds, 0, link.time.minutes, link.time.seconds)

    // console.log(countHour, countMins, countSeconds, newTime.hours, newTime.minutes, newTime.seconds, link.time.minutes, link.time.seconds)
    
    countHour = newTime.hours
    countMins = newTime.minutes
    countSeconds = newTime.seconds

    stops.push({ time: newTime, atco_code: link.timing_link.route_link.to_atco_code })
    
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