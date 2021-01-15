<template>
    <l-map
      ref="myMap"
      style="height: 100%"
      :zoom="this.zoom"
    >
      <l-tile-layer :url="this.url"></l-tile-layer>

        <l-marker
          v-for="marker in this.markers"
          :key="marker.id"
          :lat-lng="marker.position"
          :icon="marker.icon"
          :icon-size="marker.iconSize"
          :icon-anchor="marker.iconAnchor"
          :rotationAngle="marker.rotationAngle"

        >
          <l-tooltip :content="marker.tooltip" />
      </l-marker>

        <l-polyline
          v-for="line in this.lines"
          :key="line.id"
          :lat-lngs="line.latlngs"
          :color="line.color"
          :weight="line.weight"
        >
          <l-tooltip :content="line.tooltip" />
      </l-polyline>
    </l-map>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getFlightSchedule } from '../services/FlightService'
// eslint-disable-next-line no-unused-vars
import { Flight } from '../entity/flight'

// eslint-disable-next-line no-unused-vars
import { Airport } from '../entity/airport'
import * as luxon from 'luxon'
import { LMap, LTileLayer, LMarker, LTooltip, LPolyline } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import LatLon from 'geodesy/latlon-nvector-spherical'
import { splitLineString, bearing } from '../entity/utilities/antimeridian'
type D = Icon.Default & {
  _getIconUrl?: string;
};

delete (Icon.Default.prototype as D)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

@Component({
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LTooltip,
    LPolyline
  }
})
export default class LiveMap extends Vue {
  zoom: number = 2.3
  // center: LatLng = latLng(47.41322, -1.219482)
  url: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  markers: any[] = []
  lines: any[] = []
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
    const map = this.$refs.myMap
    console.log('Map Object', map)
    this.flights.forEach(flight => {
      console.log('drawing flight ' + flight.asString())
      this.addMarkerForAirport(flight.departure_airport)
      this.addMarkerForAirport(flight.arrival_airport)

      const startCoordinates = new LatLon(flight.departure_airport.latitude, flight.departure_airport.longitude)
      const endCoordinates = new LatLon(flight.arrival_airport.latitude, flight.arrival_airport.longitude)

      const flightCompleteLine = {
        id: flight.id + '-start',
        tooltip: flight.asString(),
        color: 'blue',
        weight: 2,
        latlngs: [
          [flight.departure_airport.latitude, flight.departure_airport.longitude]
        ]
      }
      const completePoints :Array<LatLon> = []
      completePoints.push(new LatLon(flight.departure_airport.latitude, flight.departure_airport.longitude))

      const flightPercentComplete = flight.percentComplete() / 100
      const currentAircraftCoordinates = startCoordinates.intermediatePointTo(endCoordinates, flightPercentComplete)

      const iterations = 50
      for (var i = 0; i < iterations; i++) {
        const fraction = (i * (100 / iterations)) / 100
        const point = startCoordinates.intermediatePointTo(currentAircraftCoordinates, fraction)
        completePoints.push(new LatLon(point.latitude, point.longitude))
      }

      completePoints.push(new LatLon(currentAircraftCoordinates.latitude, currentAircraftCoordinates.longitude))

      const splitCompletePoints :Array<LatLon> = splitLineString(completePoints)
      splitCompletePoints.forEach(point => {
        flightCompleteLine.latlngs.push([point.latitude, point.longitude])
      })
      this.lines.push(flightCompleteLine)
      const flightIcon = new Icon({
        iconUrl: require('../../public/img/airplaneIcon.svg'),
        iconSize: [80, 80],
        iconAnchor: [0, 10]
      })
      const flightMarker = {
        id: flight.id,
        position: {
          lat: currentAircraftCoordinates.latitude,
          lng: currentAircraftCoordinates.longitude
        },
        tooltip: flight.asString(),
        icon: flightIcon,
        rotationAngle: bearing(flight.departure_airport.latitude, flight.departure_airport.longitude, flight.arrival_airport.latitude, flight.arrival_airport.longitude)
      }
      console.log('Flight: ' + flight.id.toString() + ' bearing: ' + flightMarker.rotationAngle)
      this.markers.push(flightMarker)

      const flightRemainingLine = {
        id: flight.id + '-end',
        tooltip: flight.asString(),
        color: 'grey',
        weight: 1,
        latlngs: [
          [currentAircraftCoordinates.latitude, currentAircraftCoordinates.longitude]
        ]
      }
      const remainingPoints :Array<LatLon> = []
      remainingPoints.push(new LatLon(currentAircraftCoordinates.latitude, currentAircraftCoordinates.longitude))

      for (var j = 0; j < iterations; j++) {
        const fraction = (j * (100 / iterations)) / 100
        const point = currentAircraftCoordinates.intermediatePointTo(endCoordinates, fraction)
        remainingPoints.push(new LatLon(point.latitude, point.longitude))
      }
      remainingPoints.push(new LatLon(endCoordinates.latitude, endCoordinates.longitude))

      const splitRemainingPoints :Array<LatLon> = splitLineString(remainingPoints)
      splitRemainingPoints.forEach(point => {
        flightRemainingLine.latlngs.push([point.latitude, point.longitude])
      })
      this.lines.push(flightRemainingLine)
    })
  }

  private addMarkerForAirport (airport :Airport) {
    const marker = {
      id: airport.iata,
      position: {
        lat: airport.latitude,
        lng: airport.longitude
      },
      tooltip: airport.iata + '/' + airport.icao
    }
    // don't allow duplicates
    if (this.markers.find(m => m.id === marker.id) == null) {
      this.markers.push(marker)
    }
  }
}
</script>

<style>

</style>
