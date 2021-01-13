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
        >
          <l-tooltip :content="marker.tooltip" />
      </l-marker>

        <l-polyline
          v-for="line in this.lines"
          :key="line.id"
          :lat-lngs="line.latlngs"
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
import { Icon, LatLng } from 'leaflet'
import { GeodesicLine } from 'leaflet.geodesic'
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

      const line = new GeodesicLine([
        new LatLng(flight.departure_airport.latitude, flight.departure_airport.longitude),
        new LatLng(flight.arrival_airport.latitude, flight.arrival_airport.longitude)
      ])

      /*
      const flightLine = {
        id: flight.id,
        tooltip: flight.asString(),
        latlngs: [
          [flight.departure_airport.latitude, flight.departure_airport.longitude],
          [flight.arrival_airport.latitude, flight.arrival_airport.longitude]
        ]
      }
      */
      this.lines.push(line)
    })
  }

  private addMarkerForAirport (airport :Airport) {
    // const departureMarker = latLng(flight.departure_airport.latitude, flight.departure_airport.longitude)
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
