const parse = require("../parseTimetable")
const path = require("path")

parse(path.join(__dirname, "../timetable.json"))