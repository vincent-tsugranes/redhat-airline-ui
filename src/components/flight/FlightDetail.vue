<template>
    <div>
        <v-card>
          <v-card-text class="text-left">
            Departure Airport: {{ flight.departure_airport.iata }} / {{ flight.departure_airport.icao }} - {{ flight.departure_airport.name }}
            <br/>
            Arrival Airport: {{ flight.arrival_airport.iata }} / {{ flight.arrival_airport.icao }} - {{ flight.arrival_airport.name }}
            <br/>
            Duration: {{ formatDuration(flight.Duration()) }}
            <br/>
            Distance: {{ flight.Distance() }} km
          </v-card-text>
        </v-card>
        <v-divider />
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
import { Duration } from 'luxon'

@Component({
  components: {
    CrewCard
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
}
</script>
