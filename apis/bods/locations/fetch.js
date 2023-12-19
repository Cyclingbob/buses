const fetch = require("node-fetch")
const xml2js = require("xml2js")

function renderQuery(object){
    var str = "?"
    for(property in object){
        str = str += `${property}=${object[property]}&`
    }
    str = str.slice(0, -1)
    return str
}

async function fetchBusLocations(key, options){
    options["api_key"] = key
    var result = await fetch("https://data.bus-data.dft.gov.uk/api/v1/datafeed/" + renderQuery(options), {
        headers: {
            'Accept': "text/xml"
        }
    }).then(res => res.text()).then(async text => xml2js.parseStringPromise(text))
    return result
}

async function parseBusLocations(data){
    var service_delivery = data.Siri.ServiceDelivery[0]
    var vehicle_delivery = service_delivery.VehicleMonitoringDelivery[0]
    var vehicle_activity = vehicle_delivery.VehicleActivity

    return vehicle_activity.map(bus => {

        var vehicle_journey = bus.MonitoredVehicleJourney[0]

        if(bus.Extensions[0].VehicleJourney){
            var vehicle = {
                operator_code: bus.Extensions[0].VehicleJourney[0].VehicleUniqueId[0],
                ticket_machine_service_code: bus.Extensions[0].VehicleJourney[0].Operational[0].TicketMachine[0].TicketMachineServiceCode[0],
                ticket_machine_journey_code: bus.Extensions[0].VehicleJourney[0].Operational[0].TicketMachine[0].JourneyCode[0],
                bods_vehicle_ref: vehicle_journey.VehicleRef[0]
            }
        } else var vehicle = null

        return {
            block_reference: vehicle_journey.BlockRef[0],
            line: vehicle_journey.LineRef[0],
            published_line: vehicle_journey.PublishedLineName[0],
            direction: vehicle_journey.DirectionRef[0],
            operator: vehicle_journey.OperatorRef[0],
            origin: {
                ref: vehicle_journey.OriginRef ? vehicle_journey.OriginRef[0] : null,
                name: vehicle_journey.OriginName ? vehicle_journey.OriginName[0] : null,
                aimedDeparture: vehicle_journey.OriginAimedDepartureTime ? vehicle_journey.OriginAimedDepartureTime[0] : null,
            },
            destination: {
                ref: vehicle_journey.DestinationRef[0],
                name: vehicle_journey.DestinationName ? vehicle_journey.DestinationName[0] : null,
                aimedArrival: vehicle_journey.DestinationAimedArrivalTime ? vehicle_journey.DestinationAimedArrivalTime[0] : null,
            },
            current: {
                bearing: vehicle_journey.Bearing ? vehicle_journey.Bearing[0] : null,
                longitude: vehicle_journey.VehicleLocation[0].Longitude[0],
                latitude: vehicle_journey.VehicleLocation[0].Latitude[0]
            },
            vehicle,
            journey_reference: {
                date: vehicle_journey.FramedVehicleJourneyRef[0].DataFrameRef[0],
                journey_reference: vehicle_journey.FramedVehicleJourneyRef[0].DatedVehicleJourneyRef[0],
            }
        }
    })
}

async function fetchBuses(key, options){
    var response = await fetchBusLocations(key, options)
    return await parseBusLocations(response)
}

fetchBuses("70c3aa2053ee402bb9d024b5f88bdb32aa5ef691", { operatorRef: "ARHE" }).then(buses => {
    console.log(buses[0])
})