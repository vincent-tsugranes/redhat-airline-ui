<template>
    <v-container grid-list-lg fluid>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
        ></v-text-field>
      <br/>
      <v-layout row wrap class="ma-lg-5">
          <v-flex v-for="airport in airportsList()" :key="airport.iata">
            <AirportCard class="airport-card" :airport="airport" />
          </v-flex>
      </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import AirportCard from '@/components/flight/AirportCard.vue'
import { Airport } from '@/entity/airport'
// import * as luxon from 'luxon'

@Component({
  components: {
    AirportCard
  }
})
export default class AirportList extends Vue {
  airports: Array<Airport> = []
  search: string = ''

  created () {
  }

  mounted () {
    this.$store.dispatch('ENSURE_LOADED_AIRPORTS').then(() => {
      this.airports = this.$store.state.airports
      // console.log('AIRPORTS: ' + this.airports)
    })
  }

  airportsList () {
    return this.airports.filter(a =>
      a.iata.toLowerCase().includes(this.search.toLowerCase()) ||
      a.icao.toLowerCase().includes(this.search.toLowerCase()) ||
      a.name.toLowerCase().includes(this.search.toLowerCase()) ||
      a.country.toLowerCase().includes(this.search.toLowerCase())
    )
  }
}
</script>
<style>
.airport-card {
    max-width: 350px;
    max-height: 300px;
}
</style>
