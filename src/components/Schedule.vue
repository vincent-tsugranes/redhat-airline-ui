<template v-if="this.$store.state.loaded">
      <div>
        <v-row class="top-row">
          <v-col>
            <v-btn
              class="mx-2"
              fab
              dark
              x-small
              color="primary"
              @click="shiftLeft()"
            >
              <v-icon dark>
                mdi-arrow-left
              </v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
                small
                dark
                @click="showDays(1)"
              >
                Today
             </v-btn>
          </v-col>
          <v-col>
            <v-btn
              small
              dark
              @click="showDays(4)"
            >
            4 Days
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              small
              dark
              @click="showDays(7)"
            >
              Week
             </v-btn>
          </v-col>
          <v-col>
            <v-switch
              v-model="showDelays"
              label="Delays"
              color="primary"
              @click="toggleDelays()"
            ></v-switch>
          </v-col>
          <v-col>
            <v-btn
              class="mx-2"
              fab
              dark
              x-small
              color="primary"
              @click="shiftRight()"
            >
              <v-icon dark>
                mdi-arrow-right
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <div id="schedule" class="schedule-row row" refs='schedule'>
        </div>
        <FlightSummary :flight="flight" :dialog="dialog" />
        <!--
        <v-card v-if="displayMouseOverFlight" absolute left centered shaped style="z-index: 1000" elevation="2" outlined>
            <v-card-title>Flight Title</v-card-title>
            <v-card-text>Flight Details Here</v-card-text>
        </v-card>
        -->
        <v-overlay :value="overlay">
          <v-progress-circular
            indeterminate
            size="64"
          ></v-progress-circular>
        </v-overlay>
      </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
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
  dateFilteredFlights: Array<Flight> = []

  startDate = luxon.DateTime.utc().minus({ days: 0 }).startOf('day')
  endDate = this.startDate.plus({ days: 4 })
  pixelsPerMinute = 0
  backgroundCanvas = document.createElement('canvas')
  backgroundCanvasContext = this.backgroundCanvas.getContext('2d')
  mouseoverCanvas = document.createElement('canvas')
  mouseoverCanvasContext = this.mouseoverCanvas.getContext('2d')
  aircraftBarWidth = 70
  topOffset = 64
  aircraftLineHeightMin = 40
  aircraftLineHeightMax = 80
  flightPuckHeight = 25
  headerOffset = 20
  updateFrequency = 30 // seconds between redraws - current timeline moves
  displayMouseOverFlight = false
  overlay = false
  showDelays = false

  flight: Flight | null = null
  dialog: Boolean = false

  beforeCreate () {
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
    this.GetAndDisplayFlights()
    window.setInterval(this.updateDisplay, this.updateFrequency * 1000)
  }

  showDays (count: number) {
    this.startDate = luxon.DateTime.utc().minus({ days: 0 }).startOf('day')
    this.endDate = this.startDate.plus({ days: count })
    this.GetAndDisplayFlights()
  }

  toggleDelays () {
    this.GetAndDisplayFlights()
  }

  shiftRight () {
    this.startDate = this.startDate.plus({ days: 1 })
    this.endDate = this.endDate.plus({ days: 1 })
    this.GetAndDisplayFlights()
  }

  shiftLeft () {
    this.startDate = this.startDate.minus({ days: 1 })
    this.endDate = this.endDate.minus({ days: 1 })
    this.GetAndDisplayFlights()
  }

  private GetAndDisplayFlights () {
    console.log(luxon.DateTime.local().toUTC().toFormat('HHmm') + ' - Flight Schedule from', this.startDate.toISODate(), 'to', this.endDate.minus({ days: 1 }).toISODate())

    this.$store.dispatch('ENSURE_LOADED_FLIGHTS').then(() => {
      this.flights = this.$store.state.flights
      this.aircraft = this.$store.state.aircraft

      // empty the filter array
      this.dateFilteredFlights = []
      this.flights.forEach(flight => {
        // exlude flights that arrive before our visual date, and flights that depart after our visual date
        if (flight.estimated_time_arrival.toUTC() > this.startDate.plus({ minutes: 1 }) && flight.estimated_time_departure.toUTC() < this.endDate.minus({ minutes: 1 })) {
          this.dateFilteredFlights.push(flight)
        }
      })
      this.DrawCanvas()
      this.DrawGrid()
      this.DisplayAircraft()
    })
  }

  private DrawCanvas () {
    let screenWidth = 1024
    let screenHeight = 768

    screenWidth = window.innerWidth - this.aircraftBarWidth - 50
    screenHeight = window.innerHeight - this.topOffset

    const minCanvasHeight = this.aircraftLineHeightMin * this.aircraft.length + this.topOffset

    if (screenHeight < minCanvasHeight) {
      screenHeight = minCanvasHeight
    }

    window.addEventListener('resize', this.updateDisplay)
    const totalMinutes = this.endDate.diff(this.startDate, 'minutes').minutes

    // this is a critical field - we use it to calculate flight width
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

      console.log('this.backgroundCanvas.width = ' + this.backgroundCanvas.width)
      console.log('this.aircraftBarWidth = ' + this.aircraftBarWidth)
    }
  }

  private DrawGrid () {
    // console.log('Drawing grid for ' + this.GetAllDays(this.startDate, this.endDate))
    this.DrawDays()
    // this.DrawHours()
    this.DrawCurrentTimeline()
  }

  private updateDisplay () {
    this.DrawCanvas()
    this.DrawGrid()
    this.DisplayAircraft()
  }

  private EventMouseMove (ev :MouseEvent) {
    const x = ev.offsetX
    const y = ev.offsetY
    // console.log('X: ' + x + '-Y:' + y)
    if (x > this.aircraftBarWidth) {
      const highlightedFlight = this.dateFilteredFlights.filter(function (flight) {
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
      // console.log('DAY: ', startDate.plus({ days: i }).toISODate())
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

        this.backgroundCanvasContext.beginPath()
        this.backgroundCanvasContext.moveTo(13, 0)
        this.backgroundCanvasContext.lineWidth = 1
        this.backgroundCanvasContext.strokeStyle = 'grey'
        this.backgroundCanvasContext.lineTo(13, this.backgroundCanvas.height + 20)
        this.backgroundCanvasContext.stroke()
        this.backgroundCanvasContext.closePath()
      }
    }
  }

  private DrawHours () {
    var hours = this.endDate.diff(this.startDate, 'hours').hours
    for (var i = 0; i < hours; i++) {
      if (i > 0 && i % 24 !== 0 && i % 2 === 0) {
        var horizontalStartPixel = (i * 60 * this.pixelsPerMinute) - this.aircraftBarWidth
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
    // console.log('Displaying Aircraft')

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
        if (this.$vuetify.theme.dark) {
          this.backgroundCanvasContext.fillStyle = 'white'
        } else {
          this.backgroundCanvasContext.fillStyle = 'black'
        }
        this.backgroundCanvasContext.fillText(ac.toString(), 20, (aircraftIndex * heightPerSection) - ((1 / 2) * heightPerSection) + this.headerOffset + 6)

        // line from aircraft sidebar through days
        this.backgroundCanvasContext.beginPath()
        this.backgroundCanvasContext.moveTo(0, aircraftIndex * heightPerSection + this.headerOffset)
        this.backgroundCanvasContext.lineTo(this.backgroundCanvas.width, aircraftIndex * heightPerSection + this.headerOffset)
        this.backgroundCanvasContext.strokeStyle = 'grey'
        this.backgroundCanvasContext.stroke()

        const aircraftFlights = this.flights.filter(function (flight) {
          return (flight.aircraft_registration === ac)
        })

        aircraftFlights.forEach(flight => {
          const start = this.startDate

          // exlude flights that arrive before our visual date, and flights that depart after our visual date
          if (flight.estimated_time_arrival.toUTC() < this.startDate.plus({ minutes: 1 }) || flight.estimated_time_departure.toUTC() > this.endDate.minus({ minutes: 1 })) {
            return
          }

          const minutesFromStart = flight.estimated_time_departure.toUTC().diff(this.startDate, 'minutes').minutes
          let minutesDuration = flight.estimated_time_arrival.diff(flight.estimated_time_departure, 'minutes').minutes

          if (flight.estimated_time_departure < this.startDate) {
            minutesDuration = flight.estimated_time_arrival.diff(this.startDate, 'minutes').minutes
          }

          let startXPixel = minutesFromStart * this.pixelsPerMinute + this.aircraftBarWidth
          let endXPixel = minutesDuration * this.pixelsPerMinute
          const bottomYValue = ((aircraftIndex * heightPerSection) - ((1 / 2) * heightPerSection) + ((1 / 2) * this.flightPuckHeight)) + this.headerOffset

          //  If the flight started before the current timeframe, draw it at the start
          if (startXPixel < this.aircraftBarWidth) {
            startXPixel = this.aircraftBarWidth
          }

          //  if flight extends to the next day
          let extendedEnd = false
          // If the flight ends after the current timeframe, draw it to the end
          if ((startXPixel + endXPixel) > (this.backgroundCanvas.width)) {
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
            let flightText = flight.departure_airport.iata + '-' + flight.arrival_airport.iata

            if (w < 25) {
              flightText = flight.arrival_airport.iata
            }
            this.backgroundCanvasContext.fillText(flightText, x + 2, y + (this.flightPuckHeight / 2) + 2)
            this.backgroundCanvasContext.closePath()
            if (this.showDelays && flight.delays.length > 0) {
              this.backgroundCanvasContext.beginPath()
              this.backgroundCanvasContext.arc(x, y, 5, 0, 2 * Math.PI)
              this.backgroundCanvasContext.fillStyle = 'red'
              this.backgroundCanvasContext.fill()
              this.backgroundCanvasContext.stroke()
            }
          }
        })
      }
    })
  }

  private GetFlightColor (flight: Flight) {
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
.top-row {
  margin-top: 5px;
}

.schedule-row {
  margin-top: 0px !important;
  margin-bottom: 12px;
}

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
.v-input--selection-controls {
  margin-top: 0px;
  padding-top: 0px;
}
.col {
  padding: 0px;
}
</style>
