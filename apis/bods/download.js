const fetch = require("node-fetch")
const AdmZip = require("adm-zip");
const fs = require("fs")
const path = require("path")

async function downloadAndUnzip(url, dir){
    try {
        const response = await fetch(url);
        const zipBuffer = await response.buffer();

        const zip = new AdmZip(zipBuffer)
        const entries = zip.getEntries()

        entries.forEach(entry => {
            const fileName = entry.entryName;
            const contents = entry.getData().toString('utf8')
            fs.writeFileSync(path.join(dir, fileName), contents)
            console.log('wrote ', fileName)
        })
    } catch(error){
        console.error(url)
    }
}

async function downloadAndUnzipAll(urls, dir){
    for(const url of urls){
        await downloadAndUnzip(url, dir)
    }
}


function download(set_id, key){
    fetch(`https://data.bus-data.dft.gov.uk/api/v1/dataset/${set_id}?api_key=${key}&noc=FESX`).then(res => res.json()).then(async parsed => {
        var items = []
        items = items.concat(parsed.results)

        let nextPageUrl = parsed.next
        while(nextPageUrl){
            try {
                var data2 = await fetch(nextPageUrl).then(res => res.json())
                items = items.concat(data2.results)

                nextPageUrl = data2.next
            } catch(error){
                console.error(error)
                break;
            }
        }

        var urls = items.map(item => item.url)
        downloadAndUnzipAll(urls, path.join(__dirname, "./timetables"))
    })
}

function listSets(key, noc, search){
    return fetch(`https://data.bus-data.dft.gov.uk/api/v1/dataset/?api_key=${key}&noc=${noc}&search=${search}`).then(res => res.json())
}

function downloadOne(set_id, folder){
    var url = "https://data.bus-data.dft.gov.uk/timetable/dataset/" + set_id + "/download/"
    downloadAndUnzip(url, folder)
}

module.exports = { download , listSets, downloadOne }