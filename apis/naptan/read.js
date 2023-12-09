const fs = require("fs")
const path = require("path")

async function readNAPTAN(file){
    const readStream = fs.createReadStream(file)
    var removedTitle = false
    readStream.on('data', async data => {
        var lines = data.toString().split('\n')
        if(!removedTitle){
            lines.splice(0,1) //remove the header labels
            removedTitle = true
        }
        
    })
}

module.exports = readNAPTAN