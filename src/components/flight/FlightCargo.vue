<template>
        <v-card>
          <v-card-text>
            {{ cargoLayout }}
          </v-card-text>
        </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Flight } from '../../entity/flight'
import { GetRandomCargo } from '../../services/CargoService'
// import * as luxon from 'luxon'

@Component({
  components: {
  }
})
export default class FlightCargo extends Vue {
    @Prop() readonly flight! :Flight

    cargoLayout: string = ''

    created () {
    }

    mounted () {
      GetRandomCargo(
        this.flight.aircraft_registration,
        '747-400',
        this.flight.departure_airport.iata,
        this.flight.arrival_airport.iata
      ).then(result => {
        this.cargoLayout = result
      })
    }
}
</script>
