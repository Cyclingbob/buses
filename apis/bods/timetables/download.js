const fetch = require("node-fetch")
const AdmZip = require("adm-zip");
const fs = require("fs")
const path = require("path")

async function downloadAndUnzip(url, dir){
    if(!dir) throw Error("No directories specified")
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

        return true
    } catch(error){
        throw new Error(error.toString() + ", url: " + url)
    }
}

async function downloadAndUnzipAll(urls, dir){
    for(const url of urls){
        await downloadAndUnzip(url, dir)
    }
    return true
}


function download(key, dir, noc){
    return fetch(`https://data.bus-data.dft.gov.uk/api/v1/dataset?api_key=${key}&noc=${noc}`).then(res => res.json()).then(async parsed => {
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
        downloadAndUnzipAll(urls, dir)
        return true
    })
}

function listSets(key, noc, search){

    return new Promise((resolve, reject) => {
        fetch(`https://data.bus-data.dft.gov.uk/api/v1/dataset/?api_key=${key}&noc=${noc}&search=${search}`)
        .then(res => res.json())
        .then(async response => {
            if(!response.results) return reject({
                error: "no results",
                content: response
            })

            var items = [] //to hold all results over multiple http calls
            items = items.concat(response.results) //insert the results in first call

            let nextPageUrl = response.next
            while(nextPageUrl){ //make a new http call while there is still a next url
                try {
                    var data2 = await fetch(nextPageUrl).then(res => res.json())
                    items = items.concat(data2.results)

                    nextPageUrl = data2.next //set the next url for next request
                } catch(error){
                    reject({
                        error: "Error occured whilst getting new url for the next load of results",
                        content: error.toString()
                    })
                    break;
                }
            }

            return resolve(items)

        }).catch(e => reject({
            error: "fetch error",
            content: e.toString()
        }))
    })
}

function downloadOne(set_id, folder){
    var url = "https://data.bus-data.dft.gov.uk/timetable/dataset/" + set_id + "/download/"
    return downloadAndUnzip(url, folder)
}

module.exports = { download , listSets, downloadOne }