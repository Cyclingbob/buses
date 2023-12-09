const download = require("./download")

function refresh(file){
    return download(file).then(() => {
        //downloaded

        
    }).catch(console.error)
}

module.exports = refresh

if(require.main === module){
    refresh(process.argv[2]).then(() => { console.log('done') }).catch(console.error)
}