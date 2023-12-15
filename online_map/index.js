//this express server is used to help visalise some of the route sections on a map.


const express = require("express")
const app = express()

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

const { readJSON } = require("../apis/bods/read")
const parse = require("../apis/bods/parse")

const path = require("path")
const file = path.join(__dirname, "../apis/bods", "timetable.json")

var content = readJSON(file)
var parsed = parse(content)

app.get('/route', (req, res) => {
    
    var route_section = req.query.route
    console.log(req.query)
    res.json({
        plots: parsed.plots[route_section]
    })
})

app.listen(80)