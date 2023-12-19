const path = require("path")
// const timetable = require("./timetable")
var timetable = path.join(__dirname, "./timetables/25_825-FEAO025_FEAO825--FESX-Basildon-2023-10-29-For_Reports-BODS_V1_1.xml")

const parse = require("./read").readXML
parse(timetable).then(services => {
    var line = "825"
    var bus_line = services.services[0].lines.find(a => a.line_name === line)

    var vehicle_journeys = services.vehicle_journeys.filter(a => a.line_ref === bus_line.id)
    
    console.log(vehicle_journeys[0].vehicle_journey_timing_link)
})