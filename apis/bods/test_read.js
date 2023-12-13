const path = require("path")
// const timetable = require("./timetable")
var timetable = path.join(__dirname, "./timetables/25_825-FEAO025_FEAO825--FESX-Basildon-2023-10-29-For_Reports-BODS_V1_1.xml")

const parse = require("./parse")
parse(timetable).then(timetable => {
    console.log(timetable.vehicle_journeys[0])
})