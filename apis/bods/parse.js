const xml2js = require("xml2js")
const fs = require("fs")

async function parseTimetable(file){
    let contents = fs.readFileSync(file, "utf-8")
    let xml = await xml2js.parseStringPromise(contents)
    
    if(!xml.TransXChange) throw new Error("No TransXChange property in XML file: Bad XML timetable file provided: " + file)
    xml = xml.TransXChange

    let servicedOrganisations = xml.ServicedOrganisations.map(org => {
        org = org.ServicedOrganisation[0]
        
        return {
            code: org.OrganisationCode[0],
            name: org.Name[0],
            workingDays: org.WorkingDays[0].DateRange.map(range => {
                return {
                    startDate: range.StartDate[0],
                    endDate: range.EndDate[0],
                    description: range.Description[0]
                }
            })
        }
    })

    let stopPoints = xml.StopPoints[0].AnnotatedStopPointRef.map(stop => {
        return {
            atco_code: stop.StopPointRef[0],
            common_name: stop.CommonName[0]
        }
    })

    let routeSections = xml.RouteSections[0].RouteSection.map(section => {
        return {
            id: section["$"].id,
            routeLinks: section.RouteLink.map(routeLink => {
                return {
                    id: routeLink["$"].id,
                    created: routeLink["$"].CreationDateTime,
                    modified: routeLink["$"].ModificationDateTime,
                    modification: routeLink["$"].Modification,
                    revision_number: routeLink["$"].RevisionNumber,
                    from_atco_code: routeLink.From[0].StopPointRef[0],
                    to_atco_code: routeLink.To[0].StopPointRef[0],
                    distance: routeLink.Distance[0],
                    track: routeLink.Track[0].Mapping[0].Location.map(location => {
                        return {
                            id: location["$"].id,
                            longitude: location.Longitude[0],
                            latitude: location.Latitude[0]
                        }
                    })
                }
            })
        }
    })

    let routes = xml.Routes[0].Route.map(route => {
        return {
            id: route["$"].id,
            created: route["$"].CreationDateTime,
            modified: route["$"].ModificationDateTime,
            modification: route["$"].Modification,
            revision_number: route["$"].RevisionNumber,
            private_code: route.PrivateCode[0],
            description: route.Description,
            route_section_ref: route.RouteSectionRef[0]
        }
    })

    let journey_pattern_sections = xml.JourneyPatternSections[0].JourneyPatternSection.map(section => {
        return {
            id: section["$"].id,
            timing_links: section.JourneyPatternTimingLink.map(timing_link => {

                let from = {
                    id: timing_link.From[0]["$"].id,
                    sequence_number: timing_link.From[0]["$"].SequenceNumber,
                    activity: timing_link.From[0].Activity[0],
                    timing_status: timing_link.From[0].TimingStatus[0]
                }

                let to = {
                    id: timing_link.To[0]["$"].id,
                    sequence_number: timing_link.To[0]["$"].SequenceNumber,
                    activity: timing_link.To[0].Activity[0],
                    timing_status: timing_link.To[0].TimingStatus[0]
                }

                return {
                    id: timing_link["$"].id,
                    from, to,
                    route_link_ref: timing_link.RouteLinkRef[0],
                    run_time: timing_link.RunTime[0]
                }
            })
        }
    })

    let timetable = {
        servicedOrganisations,
        stopPoints,
        routeSections,
        routes,
        journey_pattern_sections
    }
    return timetable
}

module.exports = parseTimetable