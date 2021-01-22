<template>
    <div>
      <v-dialog v-model="dialog" v-if="flight" max-width="290" persistent>
        <v-card>
          <v-card-title>Flight Detail</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            {{ flight.departure_airport.iata }} - {{ flight.arrival_airport.iata }}
          </v-card-text>
          <v-divider></v-divider>
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
