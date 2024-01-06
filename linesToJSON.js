const path = require("path")
const fs = require("fs")

const read = require("./apis/bods/timetables/read")

const fromdir = path.join(__dirname, "example_timetables")
const todir = path.join(__dirname, "example_timetables_json")

var files = fs.readdirSync(fromdir)
for(file of files){
    let location = path.join(fromdir, file)
    let newLocation = path.join(todir, file).replace('.xml', '.json')
    console.log(location, newLocation)
    read.convertToJSON(location, newLocation).then(() => {console.log(file)})
}