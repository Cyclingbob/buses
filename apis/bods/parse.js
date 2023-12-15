function getPlotsForRouteSection(routeSection){
    var plots = []
    var routeLinks = routeSection.routeLinks

    for(route of routeLinks){
        for(trackItem of route.track){
            plots.push([trackItem.latitude, trackItem.longitude])
        }
    }

    return plots
}

function getAllPlots(route_sections){
    // var all_route_sections = routes.map(route => route.route_section_ref)
    var plots = {}

    for(route_section of route_sections){
        plots[route_section.id] = getPlotsForRouteSection(route_section)
    }

    return plots
}

function parse(content){
    var routes = content.routes
    var route_sections = content.routeSections
    // var route_section = content.routeSections.find(a => a.id === route.route_section_ref)

    var plots = getAllPlots(route_sections)
    
    return {
        plots
    }
}

module.exports = parse