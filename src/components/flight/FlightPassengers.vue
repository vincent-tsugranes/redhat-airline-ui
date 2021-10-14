<template>
  <v-container>
    <v-row>
      <v-col cols="2">
        <v-img content-class="seatmap" contain :src=getSeatmap()></v-img>
      </v-col>
      <v-col cols="10" align="left">

        <!--Add Flight booking component unless in the air or already landed-->
        <div v-if="getFlightStatus() === 'Active'">
          This flight is already in the air
        </div>
        <div v-else-if="getFlightStatus() === 'Complete'">
          No cooking the booking - this is already complete
        </div>
        <div v-else>
          <FlightPassengerBooking :flight="flight" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Flight } from '../../entity/flight'
import FlightPassengerBooking from '@/components/flight/FlightPassengerBooking.vue'
// import * as luxon from 'luxon'

@Component({
  components: {
    FlightPassengerBooking
  }
})
export default class FlightPassengers extends Vue {
    @Prop() readonly flight! :Flight

    created () {
    }

    mounted () {
    }

    getFlightStatus () {
      return this.flight.status()
    }

    getSeatmap () {
      return require('../../../public/img/A380_seatmap.svg')
    }
}
</script>
