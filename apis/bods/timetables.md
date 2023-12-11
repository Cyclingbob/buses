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
