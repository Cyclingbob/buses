const fetch = require("node-fetch")
const fs = require("fs")

function downloadXML(file){

    return new Promise((resolve, reject) => {
        fetch("https://beta-naptan.dft.gov.uk/Download/National/xml").then(res => {
            var writeStream = fs.createWriteStream(file)
            res.body.pipe(writeStream)
            writeStream.on('finish', () => {
                writeStream.close()
                resolve()
            }).on('error', err => {
                reject(err)
            })
        }).catch(reject)
    })
}

module.exports = downloadXML