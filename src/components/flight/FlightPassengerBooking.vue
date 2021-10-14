<template>
  <v-card>
    <v-card-title>Create Booking</v-card-title>
    <v-card-text>
      <form id="submit-booking-form" @submit.prevent="addBooking">
        <v-row>
          <v-col>
            <v-text-field v-model="name" placeholder="passenger name" color="white" class="mx-3" />
          </v-col>
          <v-col align-self="center">
            <v-btn v-show="name != ''" type="submit" class="button is-danger mx-2" color="primary">Submit</v-btn>
          </v-col>
        </v-row>
      </form>
    </v-card-text>
      <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
        {{ snackbarText }}
        <template v-slot:action="{ attrs }">
          <v-btn
            color="blue"
            text
            v-bind="attrs"
            @click="snackbar = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Flight } from '../../entity/flight'
import { Booking } from '../../entity/booking'

@Component({
  components: {
  }
})
export default class FlightPassengerBooking extends Vue {
    @Prop() readonly flight! :Flight
    name = ''
    snackbar = false
    snackbarText = ''
    snackbarTimeout = 3000

    created () {
    }

    mounted () {
    }

    addBooking () {
      var booking = new Booking({
        name: this.name,
        flight_id: this.flight.id,
        departure_airport_iata: this.flight.departure_airport.iata,
        arrival_airport_iata: this.flight.arrival_airport.iata,
        estimated_time_departure: this.flight.estimated_time_departure,
        estimated_time_arrival: this.flight.estimated_time_arrival
      })
      this.$store.commit('ADD_BOOKING', booking)
      this.snackbarText = 'Added Booking for ' + this.name
      this.snackbar = true
      this.name = ''
    }
}
</script>
