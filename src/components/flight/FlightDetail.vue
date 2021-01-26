<template>
    <div>
        <v-card>
          <v-card-text>
            Departure Airport: {{ flight.departure_airport.iata }} / {{ flight.departure_airport.icao }}
            <br/>
            Arrival Airport: {{ flight.arrival_airport.iata }} / {{ flight.arrival_airport.icao }}
          </v-card-text>
        </v-card>
        <v-divider></v-divider>
        Crewmembers
        <br/>
        <v-row>
          <v-col
            v-for="crewmember in flight.crewmembers"
            :key="crewmember.last_name"
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
}
</script>
