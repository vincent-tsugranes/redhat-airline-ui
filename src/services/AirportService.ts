import { Flight } from '../entity/flight'
import { Airport } from '@/entity/airport'

const airportApiUrl = process.env.VUE_APP_AIRPORT_API_URL

export async function GetAirports () {
  const airportsUrl = airportApiUrl + '/airports'
  console.log('Getting Airports from ' + airportsUrl)
  const airportsResponse = await fetch(airportsUrl)
  const jsonAirports: Array<Airport> = JSON.parse(await airportsResponse.text())

  const airports: Array<Airport> = []
  // when the datetime objects are serialized, they become strings, but typescript doesn't know that - we need them as datatime
  // https://github.com/moment/luxon/issues/750
  // methods are also missing
  jsonAirports.forEach(airport => {
    airports.push(new Airport(airport))
  })

  return airports
}
