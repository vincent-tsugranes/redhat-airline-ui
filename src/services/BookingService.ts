import { Booking } from '@/entity/booking'

const bookingApiUrl = process.env.VUE_APP_BOOKING_API_URL

export async function GetAllBookings () {
  /*
  const bookings = [
    new Booking({ id: 1, name: 'Chandan Gudla', departure_airport_iata: 'IAH', arrival_airport_iata: 'ORD', flight_id: 1234 }),
    new Booking({ id: 2, name: 'John Gammon', departure_airport_iata: 'IAH', arrival_airport_iata: 'SYD', flight_id: 1235 }),
    new Booking({ id: 3, name: 'Shelby Thomas', departure_airport_iata: 'DXB', arrival_airport_iata: 'HKG', flight_id: 1236 }),
    new Booking({ id: 4, name: 'Vince Tsugranes', departure_airport_iata: 'RDU', arrival_airport_iata: 'ATL', flight_id: 1237 })
  ]
  return bookings
  */

  const bookingRequestUrl = bookingApiUrl
  console.log('Getting Bookings from ' + bookingRequestUrl)
  const bookingsResponse = await fetch(bookingRequestUrl)
  const jsonBookings = JSON.parse(await bookingsResponse.text())
  return jsonBookings
}

export async function UpsertBooking (booking: Booking) {
  const bookingPostUrl = bookingApiUrl
  console.log('Sending Booking to ' + bookingPostUrl)

  const bookingJson = JSON.stringify(booking)
  const response = await fetch(bookingPostUrl, {
    method: 'POST',
    body: bookingJson,
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    console.log('Exception Posting Booking to ' + bookingPostUrl + ': ' + response.text)
  }

  if (response.body !== null) {
    const data = JSON.parse(response.json.toString()) as Response
    return data.json
  }
}
