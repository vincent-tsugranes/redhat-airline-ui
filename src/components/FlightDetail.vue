<template>
    <div>
      <v-dialog v-model="dialog" v-if="flight" max-width="800" persistent>
        <v-card>
          <v-card-title>Flight Detail</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            {{ flight.departure_airport.iata }} - {{ flight.arrival_airport.iata }}
          </v-card-text>
          <v-divider></v-divider>
          <v-tabs>
            <v-tab key="flight-info">Flight Summary</v-tab>
            <v-tab key="flight-plan">Flightplan</v-tab>
            <v-tab key="flight-pax">Passengers</v-tab>
            <v-tab key="flight-cargo">Cargo</v-tab>
          </v-tabs>
            <v-tabs-items>
              <v-tab-item key="flight-info">Flight Details Here</v-tab-item>
              <v-tab-item key="flight-plan">Flight Plan</v-tab-item>
              <v-tab-item key="flight-pax">Passengers</v-tab-item>
              <v-tab-item key="flight-cargo">Cargo</v-tab-item>
            </v-tabs-items>
          <v-card-actions>
            <v-btn
              color="blue darken-1"
              text
              @click="toggleDialog"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { bus } from '../main'
import { Flight } from '../entity/flight'
// import * as luxon from 'luxon'

@Component
export default class FlightDetail extends Vue {
    @Prop() readonly flight! :Flight;
    @Prop() readonly dialog :Boolean = false

    created () {
    }

    mounted () {
      console.log('Flight Detail Mounted')
    }

    toggleDialog () {
      bus.$emit('dialog', !this.dialog)
    }
}
</script>
