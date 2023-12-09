const config = require("./config")
const express = require("express")
const app = express()

const path = require("path")
const naptanCSV = path.join(__dirname, "./apis/naptan/content.csv")

const search = require("./apis/naptan/search")

app.use("/express", express.static(path.join(__dirname, "public")))
app.set('view-engine', 'ejs')

function fromHeading(heading){
    if(heading === "N-bound") return "North bound"
    if(heading === "E-bound") return "East bound"
    if(heading === "S-bound") return "South bound"
    if(heading === "W-bound") return "West bound"
    if(heading === "NE-bound") return "North-East bound"
    if(heading === "NW-bound") return "North-West bound"
    if(heading === "SWbound") return "South-West bound"
    if(heading === "SE-bound") return "South-East bound"
}

function fromIndicatorCode(code){
    if(code === "o/s") return "On side with"
    if(code === "opp") return "Opposite to"
    if(code === "adj") return "Adjacent to"
    if(code.startsWith("Bay") || code.startsWith("Stand")) return code + " at"
    if(code === "entrance") return "Entrance of "
    if(code.includes("-bound")) return fromHeading(code)
    return code + ", "
}

app.get("/search", async (req, res) => {
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

    res.render(path.join(__dirname, "views", "results.ejs"), {
        query, results
    })
})

app.listen(config.port)

// var query = "Eastwood Road Rayleigh"
// var result = search.searchMany(naptanCSV, query, 0).then(console.log).catch(console.error)