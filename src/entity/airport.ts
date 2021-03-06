export class Airport {
    iata: string = ''
    icao: string = ''
    name: string = ''
    city: string = ''
    state: string = ''
    country: string = ''
    tz: string = ''
    elevation: number = 0;
    latitude: number = 0;
    longitude: number = 0;

    constructor (airport: Airport) {
      this.iata = airport.iata
      this.icao = airport.icao
      this.name = airport.name
      this.city = airport.city
      this.state = airport.state
      this.country = airport.country
      this.tz = airport.tz
      this.elevation = airport.elevation
      this.latitude = airport.latitude
      this.longitude = airport.longitude
    }

    distanceBetween (airport: Airport, unit: string = 'K') {
      const lat1 = this.latitude
      const lon1 = this.longitude
      const lat2 = airport.latitude
      const lon2 = airport.longitude

      if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0
      } else {
        var radlat1 = Math.PI * lat1 / 180
        var radlat2 = Math.PI * lat2 / 180
        var theta = lon1 - lon2
        var radtheta = Math.PI * theta / 180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
        if (dist > 1) {
          dist = 1
        }
        dist = Math.acos(dist)
        dist = dist * 180 / Math.PI
        dist = dist * 60 * 1.1515
        if (unit === 'K') {
          dist = dist * 1.609344
        }
        if (unit === 'N') {
          dist = dist * 0.8684
        }
        return +dist.toFixed(2)
      }
    }
}
