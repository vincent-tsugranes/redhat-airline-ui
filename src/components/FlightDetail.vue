/* eslint-disable no-unused-vars */
<template>
      <div>
          Flight Detail
          {{ flight.departureAirport.iata }} - {{ flight.ArrivalAirport.iata }}
      </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
// eslint-disable-next-line no-unused-vars
import { Flight } from '../entity/flight'
// import * as luxon from 'luxon'

@Component
export default class FlightDetail extends Vue {
    @Prop() private flight!: Flight;
}
</script>
