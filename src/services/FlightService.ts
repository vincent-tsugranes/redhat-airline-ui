import { Flight } from '../entity/flight'
import * as luxon from 'luxon'

export async function getFlightSchedule (start: string, end: string, aircraftCount: number = 15, flightCount: number = 20) {
  const scheduleUrl = 'http://localhost:9000/schedule?start=' + start + '&end=' + end + '&aircraftCount=' + aircraftCount + '&flightCount=' + flightCount
  console.log('Getting Schedule from ' + scheduleUrl)
  const flightsResponse = await fetch(scheduleUrl)
  const jsonFlights: Array<Flight> = JSON.parse(await flightsResponse.text())

  const flights: Array<Flight> = []
  // when the datetime objects are serialized, they become strings, but typescript doesn't know that - we need them as datatime
  // https://github.com/moment/luxon/issues/750
  // methods are also missing
  jsonFlights.forEach(flight => {
    flights.push(new Flight(flight))
  })

  return flights
}
