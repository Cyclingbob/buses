const fs = require("fs")

function sortMostRelevantFirst(query, items){

}


function searchMany(file, query){ //index of type is the index of the specific property to search by, such as Naptan code which would be 1
    return new Promise((resolve, reject) => {

        const split_query = query.split(' ')

        const readStream = fs.createReadStream(file)
        var found = []
        readStream.on('data', async data => {
            var lines = data.toString().split('\n')
            var count = 0
            while(count != lines.length -1){
                let item = lines[count]

                if(split_query.every(part => item.toLowerCase().includes(part.toLowerCase()))){
                    found.push(item)
                }

                count++
            }
        })
        readStream.on('end', () => {

            const filteredItems = found.map(item => {
                const loweredItem = item.toLowerCase();
                let score = 0;
                let lastIndex = -1;
              
                for (const part of split_query) {
                    const index = loweredItem.indexOf(part.toLowerCase(), lastIndex + 1);
                    if (index > lastIndex) {
                        score++;
                        lastIndex = index;
                    } else {
                        score = 0; // reset score if not found in order, so it appears at bottom
                        break;
                    }
                }
              
                return { item, score };
              })
              .sort((a, b) => b.score - a.score); // sort by score in descending order, so that best are at top
              
            
            resolve(filteredItems)
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