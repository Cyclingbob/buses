const fetch = require("node-fetch")
const AdmZip = require("adm-zip");
const fs = require("fs")
const path = require("path")
const xml2js = require("xml2js")

async function downloadAndUnzip(url, dir){
    try {
        const response = await fetch(url);
        const zipBuffer = await response.buffer();

        const zip = new AdmZip(zipBuffer)
        const entries = zip.getEntries()

        entries.forEach(entry => {
            const fileName = entry.entryName;
            const contents = entry.getData().toString('utf8')
            fs.writeFileSync(path.join(dir, fileName), contents)
            console.log('wrote ', fileName)
        })
    } catch(error){
        console.error(url)
    }
}

async function downloadAndUnzipAll(urls, dir){
    for(const url of urls){
        await downloadAndUnzip(url, dir)
    }
}


function download(set_id, key){
    fetch(`https://data.bus-data.dft.gov.uk/api/v1/dataset/${set_id}?api_key=${key}&noc=FESX`).then(res => res.json()).then(async parsed => {
        var items = []
        items = items.concat(parsed.results)

        let nextPageUrl = parsed.next
        while(nextPageUrl){
            try {
                var data2 = await fetch(nextPageUrl).then(res => res.json())
                items = items.concat(data2.results)

                nextPageUrl = data2.next
            } catch(error){
                console.error(error)
                break;
            }
        }

        var urls = items.map(item => item.url)
        downloadAndUnzipAll(urls, path.join(__dirname, "./timetables"))
    })
}

function listSets(key){
    fetch(`https://data.bus-data.dft.gov.uk/api/v1/dataset/?api_key=${key}&noc=FESX&search=Essex`).then(res => res.json()).then(parsed => {
        console.log(parsed)
    })
}

function downloadOne(set_id, folder){
    var url = "https://data.bus-data.dft.gov.uk/timetable/dataset/" + set_id + "/download/"
    downloadAndUnzip(url, folder)
}

// download("", process.env.api_key)


function read(file){
    var contents = fs.readFileSync(file, "utf-8")
    xml2js.parseStringPromise(contents).then(parsed => {
        parsed = parsed.TransXChange

        var journey_sections = parsed.JourneyPatternSections[0].JourneyPatternSection
        var a_journey_section = journey_sections[0]
        var id = a_journey_section["$"].id
        var a_timing_link = a_journey_section.JourneyPatternTimingLink[0]

        console.log(a_timing_link.From[0])
        // var days_working = parsed.ServicedOrganisations[0].ServicedOrganisation[0].WorkingDays[0].DateRange
        // console.log(days_working)
        
        // var stop_points = parsed.StopPoints[0].AnnotatedStopPointRef
        // var route_sections = parsed.RouteSections[0].RouteSection
        // var a_route_section = route_sections[0].RouteLink
        
        // var routes = parsed.Routes[0].Route
        // var a_route = routes[8]

        // var operators = parsed.Operators[0].Operator
        // var garages = operators[0].Garages[0].Garages

        // var services = parsed.Services[0].Service[0].StandardService[0].JourneyPattern[0]

        // var vehicle_journeys = parsed.VehicleJourneys[0].VehicleJourney //the timetables
        // console.log(vehicle_journeys)
    })
}

module.exports = { download, read , listSets, downloadOne }