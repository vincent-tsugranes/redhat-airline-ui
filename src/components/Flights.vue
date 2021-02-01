<template>
  <v-card>
        <FlightSummary :flight="flight" :dialog="dialog" />
        <v-divider></v-divider>
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
          <v-data-table
            :headers="headers"
            :items="flights"
            :search="search"
            :single-select=true
            @click:row="rowClick"
          >
            <template slot="headers" scope="props">
              <tr>
                <th>
                </th>
                <th v-for="header in props.headers" :key="header.text"
                  :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                  @click="changeSort(header.value)"
                >
                  <v-icon>arrow_upward</v-icon>
                  {{ header.text }}
                </th>
              </tr>
            </template>
            <template slot="items" scope="props">
              <tr :active="props.selected" @click="props.selected = !props.selected">
                    <td class="text-left">{{ flight.id }}</td>
                    <td class="text-left">{{ flight.aircraft_registration }}</td>
                    <td class="text-left">{{ flight.departure_airport.iata }}</td>
                    <td class="text-left">{{ flight.arrival_airport.iata }}</td>
                    <td class="text-left">{{ flight.estimated_time_departure }}</td>
                    <td class="text-left">{{ flight.estimated_time_arrival }}</td>
              </tr>
            </template>
          </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getFlightSchedule } from '../services/FlightService'
import FlightSummary from '@/components/flight/FlightSummary.vue'
import { Flight } from '../entity/flight'
import { bus } from '../main'
import * as luxon from 'luxon'

@Component({
  components: {
    FlightSummary
  }
})
export default class Flights extends Vue {
  flights: Array<Flight> = []
  flight: Flight | null = null
  dialog :Boolean = false
  dateFormat = 'MM/dd HHmm'
  search = ''
  headers = [
    { text: 'ID', value: 'id' },
    { text: 'Aircraft', value: 'aircraft_registration' },
    { text: 'DEP', value: 'departure_airport.iata' },
    { text: 'ARR', value: 'arrival_airport.iata' },
    { text: 'ETD', value: 'estimated_time_departure' },
    { text: 'ETA', value: 'estimated_time_arrival' }]

  selected = []
  pagination = {
    sortBy: 'name',
    descending: false
  }

  changeSort (column :string) {
    if (this.pagination.sortBy === column) {
      this.pagination.descending = !this.pagination.descending
    } else {
      this.pagination.sortBy = column
      this.pagination.descending = false
    }
  }

  rowClick (item :Flight, row :String) {
    // console.log('Selected: ' + item)
    this.flight = item
    this.dialog = true
    // bus.$emit('dialog', true)
  }

  /*
  private GetFlights () {
    const startDate = luxon.DateTime.utc()
    const endDate = startDate.plus({ days: 7 })
    getFlightSchedule(startDate.toISODate(), endDate.toISODate()).then(response => {
      this.flights = response
    })
  }
  */

  created () {
    var vm = this
    bus.$on('dialog', function (value :Boolean) {
      if (!value) {
        vm.dialog = value
        // console.log('PARENT - Flight: ' + vm.flight + 'dialog: ' + value)
      }
    })
  }

  mounted () {
    this.$store.dispatch('ENSURE_ACTIVE_FLIGHTS').then(() => {
      this.flights = this.$store.state.flights
    })
  }
}

</script>
<style>
.selected {
    background-color: red
}
</style>
