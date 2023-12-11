# Buses
A simple, free way to look up buses, timetables, bus stops and bus location using various open data sources from the UK government and it's child organisations.

## Searching
I have implemented a simple but efficient searching algorithm for the NAPTAN dataset. This dataset lists all the public transport nodes in the United Kingdom, such as bus stops and train stations and tram stops.
I will be making ordered files with the ATCO codes, NAPTAN code, street name, town name linked to the index(es) of NAPTAN nodes in the main file, so that it becomes faster. But for now what I have is functional.

The first algorithm on searchMany() in apis/naptan/search.js separates the query into individual strings by spaces, and then finds results that include each of the individual strings.

I am working on decoding XML files which have been uploaded to the Bus Open Data Service of all the timetables and routes of buses.
