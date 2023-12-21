const path = require("path")
// const timetable = require("./timetable")
var timetable = path.join(__dirname, "./timetables/25_825-FEAO025_FEAO825--FESX-Basildon-2023-10-29-For_Reports-BODS_V1_1.xml")

function convertRunTime(string){
    const pattern = /PT(?:(\d+)M)?(?:(\d+)S)?/i; //get an array, 2nd and 3rd elements have minutes and seconds
    const match = string.match(pattern);

    const minutes = match[1] ? parseInt(match[1], 10) : 0;
    const seconds = match[2] ? parseInt(match[2], 10) : 0;
    const totalSeconds = minutes * 60 + seconds;

    return { minutes, seconds, totalSeconds }
}

function searchJourneyPatternArray(journey_pattern_sections, timing_link_ref){ //for finding timing links in journey pattern sections
    for(journey_pattern_section of journey_pattern_sections){
        for(timing_link of journey_pattern_section.timing_links){
            if(timing_link.id === timing_link_ref) return timing_link //you can also include the ID of the journey pattern section if you want
        }
    }
    return null
}

function searchForRouteLinks(routeSections, routeLinkID){
    for(routeSection of routeSections){
        for(routeLink of routeSection.routeLinks){
            if(routeLink.id === routeLinkID) return routeLink //you can also include the ID of the route section if you want
        }
    }
    return null
}

const parse = require("./read").readXML
parse(timetable).then(services => {
    var line = "825"
    var bus_line = services.services[0].lines.find(a => a.line_name === line)

    var vehicle_journeys = services.vehicle_journeys.filter(a => a.line_ref === bus_line.id)
    
    var vehicle_journey = vehicle_journeys[0]
    var timing_links = vehicle_journey.vehicle_journey_timing_link

    var journey_timing_links = timing_links.map(a => {

        var timing_link_ref = a.journey_pattern_timing_link_ref
        var timing_link = searchJourneyPatternArray(services.journey_pattern_sections, timing_link_ref)
        var route_link_ref = timing_link.route_link_ref
        var routeLink = searchForRouteLinks(services.routeSections, route_link_ref)
        timing_link.route_link = routeLink

        return {
            timing_link,
            time: convertRunTime(a.run_time)
        }
    })

    var journeyStart = vehicle_journey.departure_time

    // var stops = journey_timing_links.map(a => {
    //     return {
    //         time: a.time,
    //         from: a.timing_link.route_link.from_atco_code,
    //         to: a.timing_link.route_link.to_atco_code,
    //         track: a.timing_link.route_link.track
    //     }
    // })

    // var stop_list = 

    // console.log(stops)
})