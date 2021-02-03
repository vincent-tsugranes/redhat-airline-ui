<template>
        <v-card>
          <v-card-text>
            <div id='flightMap'></div>
          </v-card-text>
        </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Flight } from '../../entity/flight'
import { Airport } from '../../entity/airport'
// import * as luxon from 'luxon'

import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import 'leaflet-rotatedmarker'
import { GetIntermediatePoint, GetBearing } from '../../entity/utilities/mapping'
import { FlightMarker } from '../../entity/utilities/FlightMarker'

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

@Component({
  components: {
  }
})
export default class FlightPlan extends Vue {
    @Prop() readonly flight! :Flight
    flightFeatures = new L.FeatureGroup()

    created () {
    }

    mounted () {
      console.log('Drawing Flightplan for flight: ' + this.flight.asString())
      const map = this.DisplayMap()
      this.DisplayFlight(map)
    }

    private DisplayMap () {
      var flightMap = L.map('flightMap').setView([25, 0], 3)

      // clear anything on flightplan map from previous invocation
      flightMap.eachLayer(function (layer) {
        flightMap.removeLayer(layer)
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 15,
        tileSize: 512,
        zoomOffset: -1,
        attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
      }).addTo(flightMap)

      this.flightFeatures.addTo(flightMap)
      return flightMap
    }

    private DisplayFlight (map :L.Map) {
      this.getMarkerForAirport(this.flight.departure_airport).addTo(this.flightFeatures)
      this.getMarkerForAirport(this.flight.arrival_airport).addTo(this.flightFeatures)

      const startCoordinates = new L.LatLng(this.flight.departure_airport.latitude, this.flight.departure_airport.longitude)
      const endCoordinates = new L.LatLng(this.flight.arrival_airport.latitude, this.flight.arrival_airport.longitude)

      const completeLineOptions = {
        weight: 2,
        opacity: 0.5,
        color: 'grey',
        steps: 10
      }

      const remainingLineOptions = {
        weight: 3,
        steps: 10
      }

      if (this.flight.percentComplete() > 0 && this.flight.percentComplete() < 100) {
        const currentAircraftCoordinates = GetIntermediatePoint(startCoordinates, endCoordinates, this.flight.percentComplete())

        new GeodesicLine([startCoordinates, currentAircraftCoordinates], completeLineOptions).addTo(this.flightFeatures)

        new GeodesicLine([currentAircraftCoordinates, endCoordinates], remainingLineOptions).addTo(this.flightFeatures)

        const flightIcon = new L.Icon({
          iconUrl: require('../../../public/img/airplaneIcon.svg'),
          iconSize: [50, 50],
          iconAnchor: [25, 25]
        })
        const flightBearing = GetBearing(currentAircraftCoordinates, endCoordinates)

        const marker = new FlightMarker(currentAircraftCoordinates, { icon: flightIcon, title: this.flight.asString(), rotationAngle: flightBearing })
        marker.flight = this.flight
        marker.addTo(this.flightFeatures)
      } else if (this.flight.percentComplete() === 0) {
        new GeodesicLine([startCoordinates, endCoordinates], remainingLineOptions).addTo(this.flightFeatures)
      } else {
        new GeodesicLine([startCoordinates, endCoordinates], completeLineOptions).addTo(this.flightFeatures)
      }

      const intermediatePoint = GetIntermediatePoint(startCoordinates, endCoordinates, 50)
      map.setView([intermediatePoint.lat, intermediatePoint.lng], 2)
    }

    private getMarkerForAirport (airport :Airport) :L.Marker {
      const marker = new L.Marker(
        [airport.latitude, airport.longitude],
        { title: airport.iata + '/' + airport.icao })
      return marker
    }
}
</script>
<style>
#flightMap{
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 20px;
  padding-right: 100px;
  top: 0;
  bottom: 0;
  height: 300px;
  width: 100%;
}
</style>
