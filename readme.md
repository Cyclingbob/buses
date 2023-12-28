# Buses
I am aiming to make a simple, free way to look up buses, timetables, bus stops and bus location using various open data sources from the UK government and it's child organisations. This will probably be available online via a web browser using the world wide web.

## Guide

I have been able to obtain NAPTAN data in apis/naptan. I still need to organise these files, but somehow you can now download and read the CSV data, and be able to search by it

For the bus open data service, this resides in apis/bods. There are 3 categories, live location, disruptions and timetables. I have decided to decode timetables, so I can be able to apply these to individual services that run each day, knowing the timings, the locations they call at and the plotted route.

Each sub folder of APIs has or will have a markdown file which describes the files in it.

## Searching
I have implemented a simple but efficient searching algorithm for the NAPTAN dataset. This dataset lists all the public transport nodes in the United Kingdom, such as bus stops and train stations and tram stops.
In the future I will be making ordered files with the ATCO codes, NAPTAN code, street name, town name linked to the index(es) of NAPTAN nodes in the main file, so that it becomes faster. But for now what I have is functional.

The first algorithm on searchMany() in apis/naptan/search.js separates the query into individual strings by spaces, and then finds results that include each of the individual strings.

I am working on decoding XML files which have been uploaded to the Bus Open Data Service of all the timetables and routes of buses.


## What I know
I've now been able to determine:

-There are "routeSections", each with an id. Route sections define the lat/longs of a route from start to finish. These have an ID RSx or RSxx
-These route sections are referenced in "routes" of a JSON encoded document created by api/bods/read.js. These have an ID of RTx or RTxx
-These route sections are referenced in "services" in the standard_service > journey_pattern array

## What's next
In api/bods/timetables/download.js I want the promise for downloadOne and downloadMany to return a list of all the XML files that are created when a timetable is downloaded.