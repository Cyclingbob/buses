function parseTimetables(arr){
    var lines = []

    for(service of arr.services){
        for(line of service.lines){
            console.log(service.standard_service.journey_pattern)
        }
    }

    return lines
}

const fs = require("fs")
const path = require("path")

function parseTimetableFiles(dir){
    let files = fs.readdirSync(dir)
    let lines = []
    for(file of files){
        let content = parseTimetables(JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")))
        lines.push(content)
    }
    return lines
}

module.exports = { parseTimetableFiles, parseTimetables }