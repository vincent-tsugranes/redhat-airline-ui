const cargoApiUrl = process.env.VUE_APP_CARGO_API_URL

export async function GetRandomCargo (aircraftRegistration: string, aircraftModel: string, departureAirport: string, arrivalAirport: string) {
  const cargoUrl = cargoApiUrl +
    '/cargo/random' +
    '?aircraftRegistration=' + aircraftRegistration +
    '&aircraftModel=' + aircraftModel +
    '&departureAirport=' + departureAirport +
    '&arrivalAirport=' + arrivalAirport
  console.log('Getting Cargo from ' + cargoUrl)
  const cargoResponse = await fetch(cargoUrl)
  const jsonCargoLayout = JSON.parse(await cargoResponse.text())

  return jsonCargoLayout
}
