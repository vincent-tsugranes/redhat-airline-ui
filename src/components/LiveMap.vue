<template>
  <div id="map"></div>
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import { Flight } from '../entity/flight'

// eslint-disable-next-line no-unused-vars
import { Airport } from '../entity/airport'

import { Component, Vue } from 'vue-property-decorator'
import { getFlightSchedule } from '../services/FlightService'
import * as luxon from 'luxon'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import 'leaflet-rotatedmarker'

// eslint-disable-next-line no-unused-vars
import { GeodesicLine } from 'leaflet.geodesic'
type D = L.Icon.Default & {
  _getIconUrl?: string;
};

delete (L.Icon.Default.prototype as D)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

@Component
export default class LiveMap extends Vue {
  flights: Array<Flight> = []
  startDate = luxon.DateTime.utc().minus({ days: 1 }).startOf('day')
  endDate = this.startDate.plus({ days: 2 })

  mounted () {
    this.GetFlights()
  }

  private GetFlights () {
    console.log('Flight Schedule from', this.startDate.toISODate(), 'to', this.endDate.toISODate())
    getFlightSchedule(this.startDate.toISODate(), this.endDate.toISODate(), 10, 10).then(response => {
      // console.log('all flights: ' + response.length)
      this.flights = response.filter(f => {
        return f.percentComplete() > 0 && f.percentComplete() < 100
      })
      console.log('live flights: ' + this.flights.length)
      this.displayFlights()
    })
  }

  private displayFlights () {
    var map = L.map('map').setView([51.505, -0.09], 3)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      noWrap: true,
      tileSize: 512,
      zoomOffset: -1,
      attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
    }).addTo(map)

    this.flights.forEach(flight => {
      this.getMarkerForAirport(flight.departure_airport).addTo(map)
      this.getMarkerForAirport(flight.arrival_airport).addTo(map)

      const startCoordinates = new L.LatLng(flight.departure_airport.latitude, flight.departure_airport.longitude)
      const endCoordinates = new L.LatLng(flight.arrival_airport.latitude, flight.arrival_airport.longitude)
      const currentAircraftCoordinates = this.GetIntermediatePoint(startCoordinates, endCoordinates, flight.percentComplete())

      const completeLineOptions = {
        weight: 2,
        opacity: 0.5,
        color: 'grey',
        steps: 20
      }

      new GeodesicLine([startCoordinates, currentAircraftCoordinates], completeLineOptions).addTo(map)

      const remainingLineOptions = {
        weight: 3,
        opacity: 0.5,
        color: 'blue',
        steps: 20
      }
      new GeodesicLine([currentAircraftCoordinates, endCoordinates], remainingLineOptions).addTo(map)

      const flightIcon = new L.Icon({
        iconUrl: require('../../public/img/airplaneIcon.svg'),
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      })
      const flightBearing = this.GetBearing(startCoordinates.wrap(), endCoordinates.wrap())
      new L.Marker(currentAircraftCoordinates, { icon: flightIcon, title: flight.asString(), rotationAngle: flightBearing }).addTo(map)
    })
  }

  private getMarkerForAirport (airport :Airport) :L.Marker {
    const marker = new L.Marker(
      [airport.latitude, airport.longitude],
      { title: airport.iata + '/' + airport.icao })
    return marker
  }

  private GetIntermediatePoint (startPoint :L.LatLng, endPoint :L.LatLng, percent :number) {
    //  derived from geojs library: https://code.google.com/p/geojs/source/browse/trunk/src/math/earth.js
    percent = percent / 100

    const phi1 = this.ToRadians(startPoint.lat)
    const phi2 = this.ToRadians(endPoint.lat)
    const lmd1 = this.ToRadians(startPoint.lng)
    const lmd2 = this.ToRadians(endPoint.lng)

    const cosPhi1 = Math.cos(phi1)
    const cosPhi2 = Math.cos(phi2)

    const angularDistance = this.AngularDistance(startPoint, endPoint)
    const sinAngularDistance = Math.sin(angularDistance)

    const a = Math.sin((1 - percent) * angularDistance) / sinAngularDistance
    const b = Math.sin(percent * angularDistance) / sinAngularDistance

    const x = a * cosPhi1 * Math.cos(lmd1) +
            b * cosPhi2 * Math.cos(lmd2)

    const y = a * cosPhi1 * Math.sin(lmd1) +
            b * cosPhi2 * Math.sin(lmd2)

    const z = a * Math.sin(phi1) +
            b * Math.sin(phi2)

    const latitude = this.ToDegrees(Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))))
    const longitude = this.ToDegrees(Math.atan2(y, x))

    return new L.LatLng(latitude, longitude)
  }

  // Converts from degrees to radians.
  private ToRadians (degrees :number) {
    return degrees * Math.PI / 180
  }

  // Converts from radians to degrees.
  private ToDegrees (radians :number) {
    return radians * 180 / Math.PI
  }

  private AngularDistance (startPoint :L.LatLng, endPoint :L.LatLng) {
    var phi1 = this.ToRadians(startPoint.lat)
    var phi2 = this.ToRadians(endPoint.lat)

    var dPhi = this.ToRadians(endPoint.lat - startPoint.lat)
    var dLmd = this.ToRadians(endPoint.lng - startPoint.lng)

    var a = Math.pow(Math.sin(dPhi / 2), 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.pow(Math.sin(dLmd / 2), 2)

    return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  private GetBearing (startPoint :L.LatLng, endPoint :L.LatLng) {
    const startLat = this.ToRadians(startPoint.lat)
    const startLng = this.ToRadians(startPoint.lng)
    const endLat = this.ToRadians(endPoint.lat)
    const endLng = this.ToRadians(endPoint.lng)

    const y = Math.sin(endLng - startLng) * Math.cos(endLat)
    const x = Math.cos(startLat) * Math.sin(endLat) -
          Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng)
    let result = Math.atan2(y, x)
    result = this.ToDegrees(result)
    return (result + 360) % 360
  }
}
</script>

<style>
#map{
  position: absolute;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 20px;
  padding-right: 100px;
  top: 0;
  bottom: 0;
  width: 100%;
}
.info {
  margin-right: 100px;
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.info h4 {
  margin: 0 0 5px;
  font: 22px/24px Arial, Helvetica, sans-serif;
  color: #777;
}
</style>
