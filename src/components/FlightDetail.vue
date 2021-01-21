/* eslint-disable no-unused-vars */
<template>
    <div>
        <h4>Flight Detail</h4>
        <div v-if="flight" v-bind="flight">
          {{ flight.departureAirport.iata }} - {{ flight.ArrivalAirport.iata }}
      </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
// eslint-disable-next-line no-unused-vars
import { Flight } from '../entity/flight'
// import * as luxon from 'luxon'

@Component
export default class FlightDetail extends Vue {
    @Prop() readonly flight!: Flight;

    mounted () {
      console.log('Flight Detail Mounted')
    }
}
</script>
