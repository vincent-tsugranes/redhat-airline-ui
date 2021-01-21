<template>
  <v-card>
        <FlightDetail :flight="flight" />
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
            show-select
            :single-select=true
          >
            <template slot="headers" scope="props">
              <tr>
                <th>
                  <v-checkbox
                    primary
                    hide-details
                    :input-value="props.all"
                    :indeterminate="props.indeterminate"
                  ></v-checkbox>
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
                <td>
                  <v-checkbox
                    primary
                    hide-details
                    :input-value="props.selected"
                  ></v-checkbox>
                </td>
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
import FlightDetail from '@/components/FlightDetail.vue'
import { Flight } from '../entity/flight'
import * as luxon from 'luxon'

@Component({
  components: {
    FlightDetail
  }
})
export default class Flights extends Vue {
  flights: Array<Flight> = []
  // flight :Object = {}
  flight: Flight | null = null
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

  private GetFlights () {
    const startDate = luxon.DateTime.utc()
    const endDate = startDate.plus({ days: 7 })
    getFlightSchedule(startDate.toISODate(), endDate.toISODate()).then(response => {
      this.flights = response
    })
  }

  mounted () {
    this.GetFlights()
  }

  OpenFlightDetail (flight :Flight) {
    // const flightDetailModal = new FlightDetail({ flight: flight })
    alert('Alert! opening flight modal')
  }
}

</script>
<style>
.selected {
    background-color: red
}
</style>
