const config = require("./config")
const express = require("express")
const app = express()

const path = require("path")
const naptanCSV = path.join(__dirname, "./apis/naptan/content.csv")

const search = require("./apis/naptan/search")

app.use("/express", express.static(path.join(__dirname, "public")))
app.set('view-engine', 'ejs')

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

app.get("/search", async (req, res) => {
    if(req.query.q){
        var query = decodeURIComponent(req.query.q)
        var results = await search.searchMany(naptanCSV, query)
    
        results = results.map(result => {
            let split = result.item.split(',')
    
            let indicator = split[14]
            let commonName = split[4]
            let town = split[18]
    
            if(indicator !== ""){
                return `${fromIndicatorCode(indicator)} ${commonName} (${town})`
            } else {
                return `${commonName} in ${town}`
            }
        })
    }

    if(!results) var results = []
    if(!req.query.q) var query = ""
    
    res.render(path.join(__dirname, "views", "results.ejs"), {
        query, results
    })
    
})

app.listen(config.port)

// var query = "Eastwood Road Rayleigh"
// var result = search.searchMany(naptanCSV, query, 0).then(console.log).catch(console.error)