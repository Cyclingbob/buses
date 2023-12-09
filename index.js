const config = require("./config")
const express = require("express")
const app = express()

const path = require("path")
const naptanCSV = path.join(__dirname, "./apis/naptan/content.csv")

const search = require("./apis/naptan/search")

app.use("/express", express.static(path.join(__dirname, "public")))
app.set('view-engine', 'ejs')

app.get("/search", async (req, res) => {
    var query = decodeURIComponent(req.query.q)
    var results = await search.searchMany(naptanCSV, query)

    results = results.map(result => {
        let split = result.item.split(',')
        return `${split[4]} (${split[18]})`
    })

    res.render(path.join(__dirname, "views", "results.ejs"), {
        query, results
    })
})

app.listen(config.port)

// var query = "Eastwood Road Rayleigh"
// var result = search.searchMany(naptanCSV, query, 0).then(console.log).catch(console.error)