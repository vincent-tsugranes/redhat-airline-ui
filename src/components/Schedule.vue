<template>
      <div>
        <div id="schedule" class="row" refs='schedule' style="padding-top: 20px; padding-bottom: 11px">
        </div>
        <FlightSummary :flight="flight" :dialog="dialog" />
        <!--
        <v-card v-if="displayMouseOverFlight" absolute left centered shaped style="z-index: 1000" elevation="2" outlined>
            <v-card-title>Flight Title</v-card-title>
            <v-card-text>Flight Details Here</v-card-text>
        </v-card>
        -->
      </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getFlightSchedule } from '../services/FlightService'
import { Flight } from '../entity/flight'
import * as luxon from 'luxon'
import { bus } from '../main'
import FlightSummary from '@/components/flight/FlightSummary.vue'

@Component({
  components: {
    FlightSummary
  }
})
export default class Schedule extends Vue {
  flights: Array<Flight> = []
  aircraft: Array<String> = []

  startDate = luxon.DateTime.utc().minus({ days: 1 }).startOf('day')
  endDate = this.startDate.plus({ days: 4 })
  pixelsPerMinute = 0
  backgroundCanvas = document.createElement('canvas')
  backgroundCanvasContext = this.backgroundCanvas.getContext('2d')
  mouseoverCanvas = document.createElement('canvas')
  mouseoverCanvasContext = this.mouseoverCanvas.getContext('2d')
  aircraftBarWidth = 70
  topOffset = 64
  aircraftLineHeightMin = 50
  aircraftLineHeightMax = 100
  flightPuckHeight = 25
  headerOffset = 20
  displayMouseOverFlight = false

  flight: Flight | null = null
  dialog :Boolean = false

  data () {
    return {
      // mouseOverFlight: this.mouseOverFlight
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

  mounted () {
    this.GetFlights()
  }

  private GetFlights () {
    console.log('Flight Schedule from', this.startDate.toISODate(), 'to', this.endDate.toISODate())
    getFlightSchedule(this.startDate.toISODate(), this.endDate.toISODate(), 10, 20).then(response => {
      this.flights = response
      this.aircraft = this.GetAircraft(this.flights)
      console.log('flights: ' + this.flights.length)
      console.log('aircraft: ' + this.aircraft)
      this.DrawCanvas()
      this.DrawGrid()
      this.DisplayAircraft()
      this.DisplayFlights()
    })
  }

  private GetAircraft (flights: Array<Flight>) {
    // eslint-disable-next-line no-array-constructor
    var aircraft = new Array()

    flights.forEach(flight => {
      if (!aircraft.includes(flight.aircraft_registration)) {
        aircraft.push(flight.aircraft_registration)
      }
    })

    return aircraft
  }

  private DisplayFlights () {
    console.log('Displaying Flights')
  }

  private DrawCanvas () {
    let screenWidth = 1024
    let screenHeight = 768

    screenWidth = window.innerWidth
    screenHeight = window.innerHeight - this.topOffset

    window.addEventListener('resize', this.windowResize)
    const totalMinutes = this.endDate.diff(this.startDate, 'minutes').minutes

    this.pixelsPerMinute = (screenWidth - this.aircraftBarWidth) / totalMinutes

    const scheduleDiv = document.getElementById('schedule')

    if (scheduleDiv != null) {
      scheduleDiv.innerHTML = ''
      this.mouseoverCanvas.setAttribute('id', 'mouseoverCanvas')
      this.mouseoverCanvas.setAttribute('class', 'mouseoverCanvas')
      this.mouseoverCanvas.height = screenHeight
      this.mouseoverCanvas.width = screenWidth

      this.backgroundCanvas.setAttribute('id', 'backgroundCanvas')
      this.backgroundCanvas.height = screenHeight
      this.backgroundCanvas.width = screenWidth

      this.backgroundCanvas.addEventListener('mousemove', this.EventMouseMove, false)
      this.backgroundCanvas.addEventListener('click', this.EventMouseClick, false)

      scheduleDiv.appendChild(this.backgroundCanvas)
      scheduleDiv.appendChild(this.mouseoverCanvas)
    }
  }

  private DrawGrid () {
    // console.log('Drawing grid for ' + this.GetAllDays(this.startDate, this.endDate))
    this.DrawDays()
    // this.DrawHours()
    this.DrawCurrentTimeline()
  }

  private windowResize () {
    this.DrawCanvas()
    this.DrawGrid()
    this.DisplayAircraft()
    this.DisplayFlights()
  }

  private EventMouseMove (ev :MouseEvent) {
    const x = ev.offsetX
    const y = ev.offsetY
    // console.log('X: ' + x + '-Y:' + y)
    if (x > this.aircraftBarWidth) {
      const highlightedFlight = this.flights.filter(function (flight) {
        return flight.inside(x, y)
      })
      if (highlightedFlight.length > 0) {
        const flight = highlightedFlight[0]
        // this.flightCardTitle = 'Flight: ' + flight.id.toString() + ' ' + flight.departure_airport.iata + '-' + flight.arrival_airport.iata
        this.displayMouseOverFlight = true
        this.DisplayTooltipForFlight(flight, x, y)
      } else {
        this.displayMouseOverFlight = false
        if (this.mouseoverCanvasContext != null) {
          this.mouseoverCanvasContext.clearRect(0, 0, this.mouseoverCanvas.width, this.mouseoverCanvas.height)
        }
      }
    }
  }

  private DisplayTooltipForFlight (flight :Flight, x :number, y :number) {
    const boxWidth = 120
    const boxHeight = 120
    let effectiveX = x
    const dateFormat = 'MM/dd HHmm'

    // draw box
    if (this.mouseoverCanvasContext != null) {
      this.mouseoverCanvasContext.clearRect(0, 0, this.mouseoverCanvas.width, this.mouseoverCanvas.height)
      // console.log('Displying tooltip for: ' + flight.asString())
      this.mouseoverCanvasContext.beginPath()
      if (x > this.mouseoverCanvas.width - this.aircraftBarWidth - boxWidth) {
        effectiveX = x - 10 - boxWidth
        this.mouseoverCanvasContext.rect(effectiveX, y, boxWidth, boxHeight)
      } else {
        effectiveX = x + 10
        this.mouseoverCanvasContext.rect(x + 10, y, boxWidth, boxHeight)
      }
      this.mouseoverCanvasContext.fillStyle = 'gainsboro'
      this.mouseoverCanvasContext.fill()
      this.mouseoverCanvasContext.stroke()
      this.mouseoverCanvasContext.fillStyle = 'black'
      this.mouseoverCanvasContext.fillText(flight.aircraft_registration, effectiveX, y + 10)
      this.mouseoverCanvasContext.fillText(flight.departure_airport.iata + '-' + flight.arrival_airport.iata,
        effectiveX,
        y + 20)
      this.mouseoverCanvasContext.fillText('ETD:' + flight.estimated_time_departure.toFormat(dateFormat),
        effectiveX,
        y + 30)
      this.mouseoverCanvasContext.fillText('ETA:' + flight.estimated_time_arrival.toFormat(dateFormat),
        effectiveX,
        y + 40)
      this.mouseoverCanvasContext.fillText('Status:' + flight.status(), effectiveX, y + 50)
      this.mouseoverCanvasContext.fillText('Percent Complete:' + flight.percentComplete(), effectiveX, y + 60)
      let crewmemberIndex = 70
      flight.crewmembers.forEach(crewmember => {
        if (this.mouseoverCanvasContext != null) {
          this.mouseoverCanvasContext.fillText('Crew: ' + crewmember.first_name + ' ' + crewmember.last_name, effectiveX, y + crewmemberIndex)
          crewmemberIndex += 10
        }
      })
      this.mouseoverCanvasContext.closePath()
    }
  }

  private EventMouseClick (ev :MouseEvent) {
    const x = ev.offsetX
    const y = ev.offsetY
    const highlightedFlight = this.flights.filter(function (flight) {
      return flight.inside(x, y)
    })
    if (highlightedFlight.length > 0) {
      const flight = highlightedFlight[0]
      this.flight = flight
      console.log('Clicked @ X: ' + x + '-Y:' + y + ' flight.id:' + flight.id)
      this.dialog = true
    }
  }

  private GetAllDays (startDate :luxon.DateTime, endDate :luxon.DateTime) {
    const allDays = []
    // console.log('Getting days between ' + startDate.toISODate() + ' and ' + endDate.toISODate())
    const duration = endDate.diff(startDate, 'days')

    for (let i = 0; i < duration.days + 1; i++) {
      allDays.push(startDate.plus({ days: i }).toISODate())
      console.log('DAY: ', startDate.plus({ days: i }).toISODate())
    }
    return allDays
  }

  private DrawDays () {
    var days = this.GetAllDays(this.startDate, this.endDate)
    for (var i = 0; i < days.length; i++) {
      var displayDate = this.startDate.plus({ days: i }).toFormat('MM/dd')
      var horizontalStartPixel = this.aircraftBarWidth + (i * 24 * 60 * this.pixelsPerMinute)
      var horizontalEndPixel = this.aircraftBarWidth + ((i + 1) * 24 * 60 * this.pixelsPerMinute)
      var horizontalMidPixel = ((horizontalEndPixel - horizontalStartPixel) / 2) + horizontalStartPixel

      if (this.backgroundCanvasContext != null) {
        // framing for aircraft and date bar
        this.backgroundCanvasContext.beginPath()
        this.backgroundCanvasContext.moveTo(0, 0)
        this.backgroundCanvasContext.lineTo(this.backgroundCanvas.width, 0)
        this.backgroundCanvasContext.moveTo(0, 20)
        this.backgroundCanvasContext.lineTo(this.backgroundCanvas.width, 20)
        this.backgroundCanvasContext.strokeStyle = 'grey'
        this.backgroundCanvasContext.stroke()
        this.backgroundCanvasContext.closePath()

        // console.log('Drawing day: ' + displayDate)
        this.backgroundCanvasContext.beginPath()
        this.backgroundCanvasContext.moveTo(horizontalStartPixel, 0)
        this.backgroundCanvasContext.lineTo(horizontalStartPixel, this.backgroundCanvas.height)
        this.backgroundCanvasContext.strokeStyle = 'grey'
        this.backgroundCanvasContext.stroke()
        this.backgroundCanvasContext.moveTo(horizontalMidPixel, 0)

        this.backgroundCanvasContext.fillStyle = 'white'
        this.backgroundCanvasContext.fillText(displayDate, horizontalMidPixel - 20, 12)
        this.backgroundCanvasContext.moveTo(horizontalEndPixel, 0)
        this.backgroundCanvasContext.lineTo(horizontalEndPixel, this.backgroundCanvas.height)
        this.backgroundCanvasContext.stroke()
        this.backgroundCanvasContext.closePath()
      }
    }
  }

  private DrawHours () {
    var hours = this.endDate.diff(this.startDate, 'hours').hours
    for (var i = 0; i < hours; i++) {
      if (i > 0 && i % 24 !== 0 && i % 2 === 0) {
        var horizontalStartPixel = this.aircraftBarWidth + (i * 60 * this.pixelsPerMinute)
        if (this.backgroundCanvasContext != null) {
          const thisHour = i % 24
          this.backgroundCanvasContext.beginPath()
          this.backgroundCanvasContext.moveTo(horizontalStartPixel, 10)
          this.backgroundCanvasContext.lineTo(horizontalStartPixel, this.backgroundCanvas.height)
          this.backgroundCanvasContext.strokeStyle = 'grey'
          this.backgroundCanvasContext.stroke()
          this.backgroundCanvasContext.fillText(thisHour.toString(), horizontalStartPixel, 20)
          this.backgroundCanvasContext.closePath()
        }
      }
    }
  }

  private DrawCurrentTimeline () {
    if (luxon.DateTime.local().toUTC() < this.endDate) {
      const currentTime = luxon.DateTime.local().toUTC()
      var minutesDifference = currentTime.diff(this.startDate, 'minutes').minutes
      var horizontalPixel = (minutesDifference * this.pixelsPerMinute) + this.aircraftBarWidth
      if (this.backgroundCanvasContext != null) {
        this.backgroundCanvasContext.beginPath()
        this.backgroundCanvasContext.moveTo(horizontalPixel, 0)
        this.backgroundCanvasContext.lineTo(horizontalPixel, this.backgroundCanvas.height)
        this.backgroundCanvasContext.strokeStyle = 'red'
        this.backgroundCanvasContext.fillStyle = 'red'
        this.backgroundCanvasContext.fillText(currentTime.toFormat('HHmm'), horizontalPixel + 2, 12)
        this.backgroundCanvasContext.stroke()
        this.backgroundCanvasContext.closePath()
        this.backgroundCanvasContext.strokeStyle = 'black'
        this.backgroundCanvasContext.fillStyle = 'black'
      }
    }
  }

  private DisplayAircraft () {
    console.log('Displaying Aircraft')

    // how much space we leave for the day bar at the top
    let heightPerSection = (this.backgroundCanvas.height - this.headerOffset) / this.aircraft.length
    if (heightPerSection < this.aircraftLineHeightMin) {
      heightPerSection = this.aircraftLineHeightMin
    }
    if (heightPerSection > this.aircraftLineHeightMax) {
      heightPerSection = this.aircraftLineHeightMax
    }

    let aircraftIndex = 0
    this.aircraft.forEach(ac => {
      aircraftIndex += 1
      if (this.backgroundCanvasContext != null) {
        this.backgroundCanvasContext.beginPath()
        this.backgroundCanvasContext.lineWidth = 1

        // you could fill the aircraft box color here
        // this.backgroundCanvasContext.fillStyle = 'black'
        // this.backgroundCanvasContext.rect(0, aircraftOffset + ((aircraftIndex - 1) * heightPerSection), this.aircraftBarWidth, heightPerSection)
        // this.backgroundCanvasContext.fill()

        // aircraft separator
        this.backgroundCanvasContext.moveTo(0, aircraftIndex * heightPerSection + this.headerOffset)
        // this.backgroundCanvasContext.lineTo(this.aircraftBarWidth, aircraftIndex * heightPerSection + this.headerOffset)
        this.backgroundCanvasContext.strokeStyle = 'grey'

        // aircraft text
        this.backgroundCanvasContext.stroke()
        this.backgroundCanvasContext.fillStyle = 'white'
        this.backgroundCanvasContext.fillText(ac.toString(), 20, (aircraftIndex * heightPerSection) - ((1 / 2) * heightPerSection) + this.headerOffset + 6)

        // line from aircraft sidebar through days
        this.backgroundCanvasContext.beginPath()
        this.backgroundCanvasContext.moveTo(0, aircraftIndex * heightPerSection + this.headerOffset)
        this.backgroundCanvasContext.lineTo(this.backgroundCanvas.width, aircraftIndex * heightPerSection + this.headerOffset)
        this.backgroundCanvasContext.strokeStyle = 'grey'
        this.backgroundCanvasContext.stroke()

        const aircraftFlights = this.flights.filter(function (flight) {
          return flight.aircraft_registration === ac
        })

        aircraftFlights.forEach(flight => {
          const minutesFromStart = flight.estimated_time_departure.diff(this.startDate, 'minutes').minutes
          let minutesDuration = flight.estimated_time_arrival.diff(flight.estimated_time_departure, 'minutes').minutes

          if (flight.estimated_time_departure < this.startDate) {
            minutesDuration = flight.estimated_time_arrival.diff(this.startDate, 'minutes').minutes
          }

          let startXPixel = minutesFromStart * this.pixelsPerMinute + this.aircraftBarWidth
          let endXPixel = minutesDuration * this.pixelsPerMinute
          const bottomYValue = ((aircraftIndex * heightPerSection) - ((1 / 2) * heightPerSection) + ((1 / 2) * this.flightPuckHeight)) + this.headerOffset

          // if the flight didn't start in the current timeframe, it's duration is not all in the current timeframe
          if (startXPixel < 0) {
            endXPixel = endXPixel + startXPixel
          }

          //  If the flight started before the current timeframe, draw it at the start
          if (startXPixel < this.aircraftBarWidth) {
            startXPixel = this.aircraftBarWidth
          }

          //  if flight extends to the next day
          let extendedEnd = false
          // If the flight ends after the current timeframe, draw it to the end
          if ((startXPixel + endXPixel) > (this.backgroundCanvas.width - this.aircraftBarWidth)) {
            endXPixel = this.backgroundCanvas.width - startXPixel// - this.aircraftBarWidth
            extendedEnd = true
          }

          if (this.backgroundCanvasContext != null) {
            this.backgroundCanvasContext.beginPath()
            const x = startXPixel
            const y = bottomYValue - this.flightPuckHeight
            const w = endXPixel
            const h = this.flightPuckHeight
            flight.puck = [x, y, w, h]
            const flightColor = this.GetFlightColor(flight)

            this.backgroundCanvasContext.rect(x, y, w, h)
            this.backgroundCanvasContext.fillStyle = flightColor
            this.backgroundCanvasContext.fill()
            this.backgroundCanvasContext.stroke()

            if (flightColor === 'blue' || flightColor === 'green') {
              this.backgroundCanvasContext.fillStyle = 'white'
            } else {
              this.backgroundCanvasContext.fillStyle = 'black'
            }
            // this.backgroundCanvasContext.fillStyle = 'white'
            if (extendedEnd) {
              this.backgroundCanvasContext.clearRect(x + w - 1, y, x + w, this.flightPuckHeight)
            }
            const flightText = flight.departure_airport.iata + '-' + flight.arrival_airport.iata
            this.backgroundCanvasContext.fillText(flightText, x + 2, y + (this.flightPuckHeight / 2) + 2)

            /*
            const flightString = ' : '.concat(
              flight.id.toString(),
              flight.departure_airport.iata, '-', flight.arrival_airport.iata,
              ' from ', flight.estimated_time_departure.toISO(), ' to ', flight.estimated_time_arrival.toISO())

            console.log('Flight: ' + flightText + ' minutesFromStart=' + minutesFromStart + flightString)
            */
          }
        })
      }
    })
  }

  private GetFlightColor (flight :Flight) {
    let color = 'blue'
    if (flight.status() === 'Complete') {
      color = 'blue'
    } else if (flight.status() === 'Active') {
      color = 'green'
    } else {
      color = 'gainsboro'
    }

    return color
  }
}

</script>

<style>
.mouseoverCanvas {
  position: absolute;
  background-color: transparent;
  z-index: 1;
  pointer-events: none;
}

.backgroundCanvas {
  position: absolute;
  background-color: transparent;
  z-index: 0;
  touch-action: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
}
</style>
