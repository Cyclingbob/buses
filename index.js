const config = require("./config")
const express = require("express")
const app = express()

const path = require("path")
const fs = require("fs")

const naptanCSV = path.join(__dirname, "./apis/naptan/content.csv")

const search = require("./apis/naptan/search")
const fetch_stop = require("./apis/naptan/fetch")

app.use("/public", express.static(path.join(__dirname, "public")))
app.set('view-engine', 'ejs')

var cache = {
    stops: {},
    lines: {}
}

function fromArrow(heading){
    heading = heading.replace('->', '')
    var hasNumber = !isNaN(heading.slice(-1))
    if(hasNumber) var number = " (" + heading.slice(-1) + ")"
    else var number = ""

    if(heading.toLowerCase().startsWith("n")) return "North bound" + number
    if(heading.toLowerCase().startsWith("e")) return "East bound" + number
    if(heading.toLowerCase().startsWith("s")) return "South bound" + number
    if(heading.toLowerCase().startsWith("w")) return "West bound" + number
    if(heading.toLowerCase().startsWith("ne")) return "North-East bound" + number
    if(heading.toLowerCase().startsWith("nw")) return "North-West bound" + number
    if(heading.toLowerCase().startsWith("sw")) return "South-West bound" + number
    if(heading.toLowerCase().startsWith("se")) return "South-East bound" + number
}

function fromHeading(heading){
    if(heading.toLowerCase() === "n-bound") return "North bound"
    if(heading.toLowerCase() === "e-bound") return "East bound"
    if(heading.toLowerCase() === "s-bound") return "South bound"
    if(heading.toLowerCase() === "w-bound") return "West bound"
    if(heading.toLowerCase() === "ne-bound") return "North-East bound"
    if(heading.toLowerCase() === "nw-bound") return "North-West bound"
    if(heading.toLowerCase() === "sw-bound") return "South-West bound"
    if(heading.toLowerCase() === "se-bound") return "South-East bound"
    return heading
}

function fromIndicatorCode(code){

    code = code.replace('O/s', "On side with")
    code = code.replace('Opp', "Opposite to")
    code = code.replace('Adj', "Adjacent to")

    code = code.replace('o/s', "On side with")
    code = code.replace('opp', "Opposite to")
    code = code.replace('adj', "Adjacent to")

    if(code === "On side with") return code
    if(code === "Opposite to") return code
    if(code === "Adjacent to") return code

    if(code.toLowerCase().startsWith("bay") || code.startsWith("stand")) return code + " at"
    // if(code.toLowerCase().startsWith('stop') )
    if(code.toLowerCase() === "entrance") return "Entrance of "
    if(code.toLowerCase().includes("-bound")) return fromHeading(code)
    if(code.toLowerCase() === "nr") return "Near"
    if(code.toLowerCase() === "at") return "At"

    if(code.toLowerCase() === "wb") return "West bound"
    if(code.toLowerCase() === "sb") return "South bound"
    if(code.toLowerCase() === "eb") return "East bound"
    if(code.toLowerCase() === "nb") return "North bound"

    if(code.toLowerCase() === "westbound") return "West bound"
    if(code.toLowerCase() === "southbound") return "South bound"
    if(code.toLowerCase() === "eastbound") return "East bound"
    if(code.toLowerCase() === "northbound") return "North bound"

    if(code.startsWith("->") && fromArrow(code) === undefined) console.log(code)
    if(code.startsWith("->")) return fromArrow(code)

    if(code.toLowerCase() === "after") return "After"

    var capitalised = code.charAt(0).toUpperCase() + code.slice(1)
    return capitalised + ", "
}

function decodeStop(string){
    let s = string.split(',')
    return {
        atco_id: s[0],
        naptan_code: s[1],
        plate_code: s[2],
        cleardown_code: s[3],
        common_name: s[4],
        common_name_lang: s[5],
        short_common_name: s[6],
        short_common_name_lang: s[7],
        landmark: s[8],
        landmark_lang: s[9],
        street: s[10],
        street_lang: s[11],
        crossing: s[12],
        crossing_lang: s[13],
        indicator: s[14],
        rendered_indicator: fromIndicatorCode(s[14]),
        indicator_lang: s[15],
        bearing: s[16],
        Nptg_locality_code: s[17],
        locality_name: s[18],
        parent_locality_name: s[19],
        grand_parent_locality_name: s[20],
        town: s[21],
        town_lang: s[22],
        suburb: s[23],
        suburb_lang: s[24],
        locality_centre: s[25],
        grid_type: s[26],
        easting: s[27],
        northing: s[28],
        longitude: s[29],
        latitude: s[30],
        stop_type: s[31],
        bus_stop_type: s[32],
        timing_status: s[33],
        default_wait_time: s[34],
        notes: s[35],
        notes_lang: s[36],
        administrative_area_code: s[37],
        created: s[38],
        modified: s[39],
        revision_number: s[40],
        modification: s[41],
        status: s[42]
    }
}

const timetable_dir = path.join(__dirname, "example_timetables_json")

const parseTimetable = require("./apis/bods/timetables/parseTimetable")

function getLines(dir){
    let lines = []
    let files = fs.readdirSync(dir)
    for(file of files){
        let content = parseTimetable(path.join(dir, file))
        lines.push(content)
    }
    return lines
}

var lines = getLines(timetable_dir)
lines = lines.map(parseTimetable)
cache.lines = lines

function fetch_line(string){
    var split_query = string.split(' ')
    var found = []
    for(line of cache.lines){
        console.log(line)
        for(service of line.services){
            for(serviceLine of service.lines){
                let line = {
                    name: serviceLine.line_name,
                    id: serviceLine.id,
                    description: serviceLine.inbound_description.description
                }
                // console.log(line)
                // found.push(line)
            }
        }

        // if(split_query.every(part => line.toLowerCase().includes(part.toLowerCase()))){ //if we find any of the keywords then push it to found list
        //     if(!item.endsWith("inactive")) found.push(item)
        //     results.push()
        //     continue;
        // }
    }
}

app.get("/search", async (req, res) => {
    if(req.query.q){
        var query = decodeURIComponent(req.query.q)
        fetch_line(req.query.q)
        var results = await search.searchMany(naptanCSV, query)
    
        results = results.map(result => {
            let split = result.item.split(',')
    
            let indicator = split[14]
            let commonName = split[4]
            let town = split[18]
            let atco_id = split[0]
    
            if(indicator !== ""){
                return {
                    indicator: fromIndicatorCode(indicator),
                    commonName, town, type: "stop", atco_id
                }
            } else {
                return { commonName, town, type: "stop", atco_id }
            }
        })
    }

    if(!results) var results = []
    if(!req.query.q) var query = ""
    
    res.render(path.join(__dirname, "views", "results.ejs"), {
        query, results
    })
    
})

app.get("/stop/:atco", async (req, res) => {
    var atco = req.params.atco
    var found = await fetch_stop(naptanCSV, atco)
    found = found.split(',')

    let indicator = found[14]
    let commonName = found[4]
    let town = found[18]
    let atco_id = found[0]
    
    console.log(decodeStop(await fetch_stop(naptanCSV, atco)))

    if(found) res.render(path.join(__dirname, "views", "stop.ejs"), {
        stop: {
            indicator: fromIndicatorCode(indicator), commonName, town, atco_id
        }
    })
})

app.listen(config.port)

// var query = "Eastwood Road Rayleigh"
// var result = search.searchMany(naptanCSV, query, 0).then(console.log).catch(console.error)