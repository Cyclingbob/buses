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

    let services = xml.Services[0].Service.map(service => {
        return {
            created: service["$"].CreationDateTime,
            modified: service["$"].ModificationDateTime,
            modification: service["$"].Modification,
            revision_number: service["$"].RevisionNumber,
            service_code: service.ServiceCode[0],
            private_code: service.PrivateCode[0],
            lines: service.Lines[0].Line.map(line => {

                var inboundVias = line.InboundDescription[0].Vias

                if(inboundVias) inboundVias = inboundVias.map(via => {
                    return via.Via[0]
                })
                else inboundVias = []

                var outboundVias = line.OutboundDescription[0].Vias
                if(outboundVias) outboundVias = outboundVias.map(via => {
                    return via.Via[0]
                })
                else outboundVias = []

                return {
                    id: line["$"].id,
                    inbound_description: {
                        description: line.InboundDescription[0].Description[0],
                        destination: line.InboundDescription[0].Destination[0],
                        origin: line.InboundDescription[0].Origin[0],
                        vias: inboundVias
                    },
                    line_name: line.LineName,
                    outbound_description: {
                        description: line.OutboundDescription[0].Description[0],
                        destination: line.OutboundDescription[0].Destination[0],
                        origin: line.OutboundDescription[0].Origin[0],
                        vias: outboundVias
                    },
                }
            }),
            operating_period: service.OperatingPeriod[0],
            registered_operator_ref: service.RegisteredOperatorRef[0],
            public_use: service.PublicUse[0],
            standard_service: {
                origin: service.StandardService[0].Origin[0],
                destination: service.StandardService[0].Destination[0],
                vias: service.StandardService[0].Vias.map(via => {
                    return via.Via[0]
                }),
                use_all_stop_points: service.StandardService[0].UseAllStopPoints[0],
                journey_pattern: service.StandardService[0].JourneyPattern.map(pattern => {
                    return {
                        id: pattern["$"].id,
                        created: pattern["$"].CreationDateTime,
                        modified: pattern["$"].ModificationDateTime,
                        modification: pattern["$"].Modification,
                        revision_number: pattern["$"].RevisionNumber,
                        destination_display: pattern.DestinationDisplay[0],
                        operator_ref: pattern.OperatorRef[0],
                        direction: pattern.Direction[0],
                        route_ref: pattern.RouteRef[0],
                        journey_pattern_section_refs: pattern.JourneyPatternSectionRefs
                    }
                })
            }
        }
    })

    let vehicle_journeys = xml.VehicleJourneys[0].VehicleJourney

    let timetable = { //missing operators
        servicedOrganisations,
        stopPoints,
        routeSections,
        routes,
        journey_pattern_sections,
        services,
        vehicle_journeys
    }
    return timetable
}

module.exports = parseTimetable