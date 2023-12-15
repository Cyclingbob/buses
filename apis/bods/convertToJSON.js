const xml2js = require("xml2js")
const fs = require("fs")

async function convertToJSON(xmlFile, jsonFile){
    let contents = fs.readFileSync(xmlFile, "utf-8")
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
                    line_name: line.LineName[0],
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

    function renderDayObject(daysOfOperation){
        var arr = []
        for(day in daysOfOperation){
            arr.push(day)
        }
        return arr
    }

    let vehicle_journeys = xml.VehicleJourneys[0].VehicleJourney.map(journey => {        
        if(journey.StartDeadRun){
        
            var from = journey.StartDeadRun[0].PositioningLink[0].From[0]
            if(from.GarageRef){
                from = { type: "garage_ref", id: from.GarageRef[0] }
            } else if(from.StopPointRef){
                from = { type: "stop_point_ref", id: from.StopPointRef[0] }
            }

            var to = journey.StartDeadRun[0].PositioningLink[0].To[0]
            if(to.GarageRef){
                to = { type: "garage_ref", id: to.GarageRef[0] }
            } else if(to.StopPointRef){
                to = { type: "stop_point_ref", id: to.StopPointRef[0] }
            }


            var start_dead_run = {
                id: journey.StartDeadRun[0]["$"].id,
                positioning_link: {
                    id: journey.StartDeadRun[0].PositioningLink[0]["$"].id,
                    run_time: journey.StartDeadRun[0].PositioningLink[0].RunTime[0],
                    from, to
                }
            }
        } else var start_dead_run = null

        if(journey.OperatingProfile[0].BankHolidayOperation[0].DaysOfOperation){
            var runs_on = renderDayObject(journey.OperatingProfile[0].BankHolidayOperation[0].DaysOfOperation[0])
        } else var runs_on = []

        if(journey.OperatingProfile[0].BankHolidayOperation[0].DaysOfOperation){
            var does_not_run_on = renderDayObject(journey.OperatingProfile[0].BankHolidayOperation[0].DaysOfNonOperation[0])
        } else var does_not_run_on = []
        
        return {
            created: journey["$"].CreationDateTime,
            modified: journey["$"].ModificationDateTime,
            modification: journey["$"].Modification,
            revision_number: journey["$"].RevisionNumber,
            sequence_number: journey["$"].SequenceNumber,
            private_code: journey.PrivateCode[0],
            operator_ref: journey.OperatorRef[0],
            operational: {
                block: {
                    description: journey.Operational[0].Block[0].Description[0],
                    block_number: journey.Operational[0].Block[0].BlockNumber[0]
                },
                ticket_machine: {
                    tm_service_code: journey.Operational[0].TicketMachine[0].TicketMachineServiceCode[0],
                    service_code: journey.Operational[0].TicketMachine[0].JourneyCode[0]
                },
            },
            operating_profile: {
                regular_days: renderDayObject(journey.OperatingProfile[0].RegularDayType[0].DaysOfWeek[0]),
                bank_holiday_operation: {
                    runs_on, does_not_run_on
                }
            },
            garage_ref: journey.GarageRef[0],
            vehicle_journey_code: journey.VehicleJourneyCode[0],
            service_ref: journey.ServiceRef[0],
            line_ref: journey.LineRef[0],
            journey_pattern_ref: journey.JourneyPatternRef[0],
            start_dead_run,
            departure_time: journey.DepartureTime[0],
            vehicle_journey_timing_link: journey.VehicleJourneyTimingLink.map(timing_link => {
                
                if(timing_link.DutyCrewCode) var duty_crew_code = timing_link.DutyCrewCode[0]
                else var duty_crew_code = null

                return {
                    id: timing_link["$"].id,
                    duty_crew_code,
                    journey_pattern_timing_link_ref: timing_link.JourneyPatternTimingLinkRef[0],
                    run_time: timing_link.RunTime[0],
                    from: timing_link.From[0].Activity[0],
                    to: timing_link.To[0].Activity[0]
                }
            })
        }
    })

    let timetable = { //missing operators
        servicedOrganisations,
        stopPoints,
        routeSections,
        routes,
        journey_pattern_sections,
        services,
        vehicle_journeys
    }
    
    fs.writeFileSync(jsonFile, JSON.stringify(timetable), "utf-8")
    return timetable
}

module.exports = convertToJSON