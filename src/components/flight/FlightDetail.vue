<template>
    <div>
        <v-card>
          <v-card-text class="text-left">
            Aircraft: {{ flight.aircraft_registration }} ({{ flight.aircraft_model }})
            <br/>
            Departure Airport: {{ flight.departure_airport.iata }} / {{ flight.departure_airport.icao }} - {{ flight.departure_airport.name }}
            <br/>
            Arrival Airport: {{ flight.arrival_airport.iata }} / {{ flight.arrival_airport.icao }} - {{ flight.arrival_airport.name }}
            <br/>
            Duration: {{ formatDuration(flight.Duration()) }}
            <br/>
            Distance: {{ flight.Distance() }} km
            <br/>
            ETD: {{ formatFlightTime(flight.estimated_time_departure) }}
            <br/>
            ETA: {{ formatFlightTime(flight.estimated_time_arrival) }}
          </v-card-text>
        </v-card>
        <v-divider />
        <v-card-text class="text-left" v-if="totalDelayTime() > 0">
          <br/>
          Total Delay Time: {{ Math.floor(totalDelayTime() / 60) }} hours, {{ totalDelayTime() % 60 }} minutes
        </v-card-text>
        <v-row v-for="delay in flight.delays"
            :key="delay.code">
          <DelayCard :delay="delay"></DelayCard>
        </v-row>
        <br/>
        <v-row>
          <v-col
            v-for="crewmember in flight.crewmembers"
            :key="crewmember.id"
          >
            <component v-bind:is="component" :crewmember="crewmember"></component>
          </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Flight } from '../../entity/flight'
// import * as luxon from 'luxon'
import CrewCard from '@/components/flight/CrewCard.vue'
import DelayCard from '@/components/flight/DelayCard.vue'
import { Duration, DateTime } from 'luxon'

@Component({
  components: {
    CrewCard,
    DelayCard
  }
})
export default class FlightDetail extends Vue {
    @Prop() readonly flight! :Flight
    component = 'CrewCard'
    created () {
    }

    mounted () {
      console.log('Flight Detail Mounted')
    }

    formatDuration (duration :Duration) {
      console.log(duration.hours + ' hours, ' + duration.minutes + ' minutes')
      return duration.hours + ' hours, ' + duration.minutes + ' minutes'
    }

    formatFlightTime (datetime: DateTime) {
      const dateFormat = 'MM/dd HHmm'
      return datetime.toFormat(dateFormat)
    }

    totalDelayTime () {
      let sum: number = 0
      this.flight.delays.forEach(a => { sum += a.minutes_duration })
      return sum
    }
}
</script>
