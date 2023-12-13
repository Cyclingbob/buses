# Timetables
Distributed in XML TransXChange format

Contains multiple sections:

## JourneyPatternSections > JourneyPatternSection > array of journey pattern sections
- Each of these has an ID
- Each of these contains multiple JourneyPatternTimingLink

Each JourneyPatternTimingLink has:
- ID
- From
- To
- RunTime
- RouteLinkRef

From, to: 
- Has ID, SequenceNumber under "$" field
- Activity
- StopPointRef (ATCO code)
- TimingStatus

## Operators > Operator > Array of operators

Property "$"
- Each of these has a creation date time
- ID
- modification
- modification date time
- revision number

Property Garages array
Each garage has:
- GarageCode
- GarageName
- Location

Each Garage Location is:
"$".id
Latitude
Longitude

Property LicenseNumber
Property NationalOperatorCode
Property OperatorCode
Property OperatorNameOnLicense
Property TradingName

## Routes > Route > Array of routes
Property "$"
- Each of these has a creation date time
- ID
- modification
- modification date time
- revision number

Property Description
Property PrivateCode
Property RouteSectionRef

## RouteSections > RouteSection > Array of route sections
Property "$"
= ID

Property RouteLink > Array of routelinks

### Each RouteLink has properties:

Property "$"
- Each of these has a creation date time
- ID
- modification
- modification date time
- revision number

Property Distance
Property From: (object with property StopPointRef)
Property To: (object with property StopPointRef)
Property Track: (object with property Mapping)

#### Mapping
Property Location
Each Location has id, latitude and longitude

## ServicedOrganisations > array of ServicedOrganisations

Property Name
Property OrganisationCode
Property WorkingDays[]

### WorkingDays
Property Description
Property StartDate
Property EndDate

## Services > array of services
Property "$"
- Each of these has a creation date time
- ID
- modification
- modification date time
- revision number

Property Lines > array of lines
Property Operating Period > StartDate
Property PrivateCode
Property PublicUse
Property RegisteredOperatorRef
Property ServiceCode
Property StandardService

### Lines
Property "$".id ID
Property InboundDescription
Property OutboundDescription

#### In/Outbound Description
Property Description
Property Destination
Property Origin
Property Vias (array of Vias)

### Standard Service
Property Destination
Property JourneyPattern
Property Origin
Property UseAllStopPoints
Property Vias[]

#### JourneyPattern
Property "$"
- Each of these has a creation date time
- ID
- modification
- modification date time
- revision number

Property Destination
Property Direction (in/outbound)
Property JourneyPatternSectionRefs
Property OperatorRef
Property RouteRef

## Property StopPoints > AnnotatedStopPointRef > Array
Property CommonName (stop name)
Property StopPointRef (atco code)

## VehicleJourneys > VehicleJourney > Array
Property "$"
- Each of these has a creation date time
- SequenceNumber
- modification
- modification date time
- revision number

Property DepartureTime
Property GarageRef
Property JourneyPatternREf
Property LineRef
Property Operating Profile
Property Operational
Property OperatorRef
Property PrivateCode
Property ServiceRef
Property StartDeadRun
Property VehicleJourneyCode
Property VehicleJourneyTimingLink

### OperatingProfile
Property BankHolidayOperation
Property RegularDayType

#### BankHolidayOperation
Property DaysOfNonOperation
Property DaysOfOperation

These will contain an object with properties that have empty strings
in other words it'll appear like this
{
BoxingDay: ['']
ChristmasDay: ['']
}

So create arrays of these dates basically, after figuring out which ones might change.

#### RegularDayType > DaysOfWeek
Sunday?

### Operational
Property Block (BlockNumber, Description)
Property TicketMachine (JourneyCode, TicketMachineServiceCode)

### StartDeadRun
Property "$".id
Property PositioningLink
Property From (GarageRef) (could be StopPointRef too i guess?)
Property RunTime
Property To (StopPointRef) (could be GarageRef too i guess?)