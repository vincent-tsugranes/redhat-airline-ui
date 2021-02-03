import * as L from 'leaflet'
import { Flight } from '../flight'

export class FlightMarker extends L.Marker {
  options: L.MarkerOptions
  flight: Flight

  // eslint-disable-next-line no-useless-constructor
  constructor (latLng: L.LatLngExpression, options?: L.MarkerOptions) {
    super(latLng, options)
  }
}
