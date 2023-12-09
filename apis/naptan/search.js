const fs = require("fs")

function searchMany(file, query){ //index of type is the index of the specific property to search by, such as Naptan code which would be 1
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(file)
        var found = []
        readStream.on('data', async data => {
            var lines = data.toString().split('\n')
            var count = 0
            while(count != lines.length -1){
                let item = lines[count]

                // if(item.includes(query)){
                //     found.push(item)
                // }

                if(query.split(' ').every(part => item.toLowerCase().includes(part.toLowerCase()))){
                    found.push(item)
                }

                count++
            }
        })
        readStream.on('end', () => {
            resolve(found)
        })
    })
}

// function searchOne(file, query, indexOfType){ //index of type is the index of the specific property to search by, such as Naptan code which would be 1
//     const readStream = fs.createReadStream(file)
//     var removedTitle = false
//     var found = false
//     var found_item = null

//     readStream.on('data', async data => {
//         var lines = data.toString().split('\n')
//         if(!removedTitle){
//             lines.splice(0,1) //remove the header labels
//             removedTitle = true
//         }
//         var count = 0
//         while(!found && count != lines.length -1){
//             // console.log(lines[count])
//             let item = lines[count].split(',')
//             // console.log(item[indexOfType].includes(query))
//             // if(item[indexOfType] === undefined){
//             //     console.log(lines.length)
//             // }
//             // console.log(item[indexOfType])
//             if(item[indexOfType]){
//                 if(item[indexOfType] == query){
//                     found_item = item
//                     readStream.close()
//                     found = true
//                 }
//             }
//             count++
//         }
//     })

//     return found_item
// }

function searchOne(file, query){
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(file)
        var found = false
        readStream.on('data', async data => {
            data = data.toString().split('\n')
            var count = 0
            while(found == false && count != data.length - 1){
                let item = data[count]
                if(item.includes(query)){
                    resolve(item)
                }
                count++
            }
        })
        readStream.on('end', () => {
            reject(null)
        })
    })
}

module.exports = { searchMany, searchOne }