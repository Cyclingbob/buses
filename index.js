const config = require("./config")
const express = require("express")
const app = express()

const path = require("path")
const naptanCSV = path.join(__dirname, "./apis/naptan/content.csv")

const search = require("./apis/naptan/search")

// app.get("/search", (req, res) => {
//     var query = decodeURIComponent(req.query.q)
//     result = search.searchOne(naptanCSV, query, 0)
//     console.log(result)
//     res.send('ok')
// })

// app.listen(config.port)

var query = "Eastwood Road Rayleigh"
var result = search.searchMany(naptanCSV, query, 0).then(console.log).catch(console.error)