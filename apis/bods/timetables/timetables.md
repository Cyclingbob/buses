# Timetables
Files here can download, read, parse into more legible and understandable information and form schedule timings.

## download.js

Contains 3 functions:
- download
- listSets
- downloadOne

### Function listSets:
Parameters:
- `api_key` (Bus Open Data Service API key)
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

### Function downloadOne

Downloads the XML files associated with a `set_id`, which can be obtained using [`listSets`](#listsets), and puts them in a folder of your choice on your file system.

Parameters:
- `set_id`
- `dir` (Directory you want the files to be saved in)

Returns a promise, which will resolve with `true` if successful. It will print out each file as it is created. If unsucessful, the promise will reject.

## Function downloadMany

Downloads the XML files associated with a NOC operator and puts them in a folder of your choice on your file system

Parameters:
- `key` (Bus Open Data Service API key)
- `dir` (Directory you want the files to be saved in)

Returns a promise, which will resolve with `true` if successful. Each file created will be printed. If unsucessful, the promise will reject.

## read.js

This file is used for converting the XML file format used by the Bus Open Data Service to JSON encoded documents, retaining all the data, but in a more user friendly way.

### readXML

Reads an XML file, converts it to a JavaScript object (timetable)

Paramters:
- `xmlFile`

Returns promise which resolves to an object representing timetable. This object is described [here](#readxml)

## Timetable Object

In order to understand the timetable object you need to understand the structure of a Bus Open Data Service Time Table, which is distributed in the TransXchange format.
This format schema can be found [here](http://www.transxchange.org.uk/schema/2.5/doc/TransXChangeSchemaGuide-2.5-v-59.pdf)

The schema is made of 7 main sections:
- servicedOrganisations,
- stopPoints,
- routeSections,
- routes,
- journey_pattern_sections,
- services,
- vehicle_journeys

### servicedOrganisation
Can be school, office, retailSite, touristAttraction, market, factory, college or military. You can specify when the service operates depending on specific organisations and it describes their working and non working days.