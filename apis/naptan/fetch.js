const fs = require("fs")

function fetchStop(file, atco_id){
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(file)
        var found = false
        readStream.on('data', async data => {
            data = data.toString().split('\n')
            var count = 0
            while(found == false && count != data.length - 1){
                let item = data[count]
                if(item){
                    var split = item.split(',')
                    if(split[0] === atco_id) resolve(item)
                }
                count++
            }
        })
        readStream.on('end', () => {
            reject(null)
        })
    })
}

module.exports = fetchStop