# Timetables
Files here can download, read, parse into more legible and understandable information and form schedule timings.

## download.js

Contains 3 functions:
- download
- listSets
- downloadOne

### listSets:
Parameters:
- `api_key` (BODS key)
- `noc` (traveline operator code (FESX for First Essex))
- `search` (for any keywords)

Returns a Promise which resolves to an array of `sets`, where a `set` describes the lines an operator is responsible for running bus services on.
Each `set` is an object. It is uniquely identified by an `id`.
It contains the operator name (`operatorName`)
, which may have multiple traveline NOC codes (`noc` - array). A `set` also has a `lines` array, containing the numbers of the lines the NOC services. The `localities` array contains an object which contains the `gazetteer_id` and `name` of each locality the NOC covers. Finally there is the `url` to download a zipped file (.zip) which contains multiple XML files describing each line, including the timetable. The XML files can be read and converted using [`read.js`](#readjs) There are other fields too, which I may eventually document in the future, or can be found on the Bus Open Data Service website. You can also print it yourself like so:
```js
const download = require("../timetables/download")
download.listSets(key, "FESX", "").then(sets => { //get the sets for an operator.
    console.log(sets)
}).catch(console.error)
```
FESX is the code for First Essex, an operator in Essex, South East England. I strongly recommend searching by NOC code, as the function will take a long time to accumulate all the operators over numberous api calls.

### downloadOne

Downloads the XML files associated with a `set_id`, which can be obtained using [`listSets`](#listsets), and puts them in a folder of your choice on your file system.

Parameters:
- `set_id`
- `folder`

Returns `true` if successful. It will print out each file as it is created.

## read.js