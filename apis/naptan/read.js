const fs = require("fs")
const path = require("path")

async function readNAPTAN(file){
    const readStream = fs.createReadStream(file)
    readStream.once('data', async data => {
        var lines = data.toString().split('\n')
        console.log(lines)
    })
}

module.exports = readNAPTAN