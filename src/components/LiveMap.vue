<template>
<div>
  <div id="map">
  </div>
  <FlightSummary :flight="flight" :dialog="dialog" />
  </div>
</template>

<script lang="ts">
import { Flight } from '../entity/flight'
import { Airport } from '../entity/airport'
import { Voyage } from '../entity/voyage'
import { Port } from '../entity/port'

import { Component, Vue } from 'vue-property-decorator'
import { getFlightSchedule } from '../services/FlightService'
import { GetSchedule, GetRoute } from '../services/OceanShippingService'
import * as luxon from 'luxon'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import 'leaflet-rotatedmarker'

import FlightSummary from '@/components/flight/FlightSummary.vue'
import { bus } from '../main'

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
    FlightSummary
  }
})
export default class LiveMap extends Vue {
  flights: Array<Flight> = []
  voyages: Array<Voyage> = []
  startDate = luxon.DateTime.utc().minus({ days: 1 }).startOf('day')
  endDate = this.startDate.plus({ days: 2 })
  flightFeatures = new L.FeatureGroup()
  shipFeatures = new L.FeatureGroup()
  showFlights = true
  showShips = false
  flight: Flight | null = null
  dialog :Boolean = false

  mounted () {
    const map = this.DisplayMap()

    if (this.showFlights) {
      this.LoadAndDisplayFlights(map)
    }
    if (this.showShips) {
      this.LoadAndDisplayShips(map)
    }
  }

  created () {
    var vm = this
    bus.$on('dialog', function (value :Boolean) {
      if (!value) {
        vm.dialog = value
        console.log('PARENT - Flight: ' + vm.flight + 'dialog: ' + value)
      }
    })
  }

  private DisplayMap () {
    var map = L.map('map').setView([51.505, -0.09], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      tileSize: 512,
      zoomOffset: -1,
      attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
    }).addTo(map)

    // add feature groups
    this.flightFeatures.addTo(map)
    this.shipFeatures.addTo(map)

    const mapControl = new L.Control({ position: 'topright' })
    const mapControlDiv = L.DomUtil.create('div', 'info')
    mapControlDiv.id = 'mapControl'
    mapControlDiv.innerHTML = '<h4>Map Layers</h4><br/>'

    const flightCheckbox = L.DomUtil.create('div', 'flightControl', mapControlDiv)
    flightCheckbox.innerHTML = '<input type="checkbox" name="flightCheckbox" checked> <label for="flightCheckbox">Flights</label><br>'
    if (!this.showFlights) {
      flightCheckbox.innerHTML = flightCheckbox.innerHTML.replace('checked', '')
    }
    flightCheckbox.onclick = (e) => {
      e.stopPropagation()
      this.showFlights = !this.showFlights
      if (!this.showFlights) {
        this.flightFeatures.clearLayers()
      } else {
        this.LoadAndDisplayFlights(map)
      }
      console.log('Flight Checkbox')
    }
    const shipsCheckbox = L.DomUtil.create('div', 'shipControl', mapControlDiv)
    shipsCheckbox.innerHTML = '<input type="checkbox" name="shipsCheckbox" checked> <label for="shipsCheckbox">Ships</label><br>'
    if (!this.showShips) {
      shipsCheckbox.innerHTML = shipsCheckbox.innerHTML.replace('checked', '')
    }
    shipsCheckbox.onclick = (e) => {
      e.stopPropagation()
      this.showShips = !this.showShips
      if (!this.showShips) {
        this.shipFeatures.clearLayers()
      } else {
        this.LoadAndDisplayShips(map)
      }
      console.log('Ship Checkbox')
    }

    mapControl.onAdd = function (map) {
      return mapControlDiv
    }

    mapControl.addTo(map)
    console.log('Added MapControl: ' + mapControl)
    return map
  }

  private FlightsCheckbox () {
    console.log('Flight Checkbox')
  }

  private LoadAndDisplayFlights (map :L.Map) {
    console.log('Flight Schedule from', this.startDate.toISODate(), 'to', this.endDate.toISODate())
    getFlightSchedule(this.startDate.toISODate(), this.endDate.toISODate(), 10, 10).then(response => {
      // console.log('all flights: ' + response.length)
      this.flights = response.filter(f => {
        return f.percentComplete() > 0 && f.percentComplete() < 100
      })
      console.log('live flights: ' + this.flights.length)
      this.DisplayFlights(map)
    })
  }

  private LoadAndDisplayShips (map :L.Map) {
    const shipStartDate = luxon.DateTime.utc().minus({ days: 20 }).startOf('day')
    const shipEndDate = shipStartDate.plus({ days: 10 }).startOf('day')
    console.log('Ship Schedule from', shipStartDate.toISODate(), 'to', shipEndDate.toISODate())
    GetSchedule(shipStartDate.toISODate(), shipEndDate.toISODate(), 15, 5).then(response => {
      this.voyages = response.filter(v => {
        return v.percentComplete() > 0 && v.percentComplete() < 100
      })
      console.log('live voyages: ' + this.voyages.length)
      this.DisplayShips(map)
    })
  }

  private FlightMarkerClick (event :L.LeafletEvent) {
    var clickedMarker = event.layer
    this.flight = clickedMarker.options.flight
    this.dialog = true
    console.log('Clicked Flight Marker - flight.id: ' + this.flight.id)
  }

  private DisplayFlights (map :L.Map) {
    this.flightFeatures.on('click', this.FlightMarkerClick)

    this.flights.forEach(flight => {
      this.getMarkerForAirport(flight.departure_airport).addTo(this.flightFeatures)
      this.getMarkerForAirport(flight.arrival_airport).addTo(this.flightFeatures)

      const startCoordinates = new L.LatLng(flight.departure_airport.latitude, flight.departure_airport.longitude)
      const endCoordinates = new L.LatLng(flight.arrival_airport.latitude, flight.arrival_airport.longitude)
      const currentAircraftCoordinates = this.GetIntermediatePoint(startCoordinates, endCoordinates, flight.percentComplete())

      const completeLineOptions = {
        weight: 2,
        opacity: 0.5,
        color: 'grey',
        steps: 10
      }

      new GeodesicLine([startCoordinates, currentAircraftCoordinates], completeLineOptions).addTo(this.flightFeatures)

      const remainingLineOptions = {
        weight: 3,
        opacity: 0.5,
        color: 'blue',
        steps: 10
      }
      new GeodesicLine([currentAircraftCoordinates, endCoordinates], remainingLineOptions).addTo(this.flightFeatures)

      /*
      const flightMarker = L.Marker.extend({
        options: {
          object: Flight
        }
      })
      */
      const flightIcon = new L.Icon({
        iconUrl: require('../../public/img/airplaneIcon.svg'),
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      })
      const flightBearing = this.GetBearing(currentAircraftCoordinates, endCoordinates)
      const flightMarker = new L.Marker(currentAircraftCoordinates, { icon: flightIcon, title: flight.asString(), rotationAngle: flightBearing, flight: flight }).addTo(this.flightFeatures)
    })
  }

  private getMarkerForAirport (airport :Airport) :L.Marker {
    const marker = new L.Marker(
      [airport.latitude, airport.longitude],
      { title: airport.iata + '/' + airport.icao })
    return marker
  }

  private DisplayShips (map :L.Map) {
    console.log('Displaying Ships')
    this.voyages.forEach(voyage => {
      this.getMarkerForShipPort(voyage.departurePort).addTo(this.shipFeatures)
      this.getMarkerForShipPort(voyage.arrivalPort).addTo(this.shipFeatures)

      const startCoordinates = new L.LatLng(voyage.departurePort.latitude, voyage.departurePort.longitude)
      const endCoordinates = new L.LatLng(voyage.arrivalPort.latitude, voyage.arrivalPort.longitude)
      // const currentShipCoordinates = this.GetIntermediatePoint(startCoordinates, endCoordinates, voyage.percentComplete())

      const routeLineOptions = {
        className: 'shippingVoyage',
        steps: 3,
        wrap: true
      }

      GetRoute(startCoordinates, endCoordinates).then(response => {
        try {
          const routeLine = new L.Geodesic().addTo(map)
          routeLine.fromGeoJson(response)
          routeLine.options = routeLineOptions
          routeLine.addTo(this.shipFeatures)
        } catch (error) {
          console.log('Error trying to add shipping route: ' + error)
        }
      })

      // new GeodesicLine([startCoordinates, endCoordinates], routeLineOptions).addTo(map)

      /*
      const shipIcon = new L.Icon({
        iconUrl: require('../../public/img/shipIcon.svg'),
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      })
      const ShipBearing = this.GetBearing(startCoordinates.wrap(), endCoordinates.wrap())
      new L.Marker(currentShipCoordinates, { icon: shipIcon, title: voyage.shipPennant, rotationAngle: ShipBearing }).addTo(map)
      */
    })
  }

  private getMarkerForShipPort (port :Port) :L.Marker {
    const marker = new L.Marker(
      [port.latitude, port.longitude],
      { title: port.name + '/' + port.code + ': ' + port.country })
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
  z-index: 2;
}

#mapControl {
  margin-right: 60px !important;
  padding: 6px 10px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  background-color: white !important;
}

.info h4 {
  margin: 0 0 5px;
  font: 16px/18px Arial, Helvetica, sans-serif;
  color: black;
}

.shippingVoyage {
  weight: 1;
  opacity: 0.5;
  color: 'green';
}

</style>
