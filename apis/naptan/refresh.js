const download = require("./download")

function refresh(file){
    download(__dirname + "/content.xml").then(() => { console.log('done') }).catch(console.error)
}

module.exports = refresh

if(require.main === module){
    refresh(process.argv[2]).then(() => { console.log('done') }).catch(console.error)
}