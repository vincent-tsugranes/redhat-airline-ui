/* eslint-disable no-unused-vars */
<template>
      <div>
          {{ msg }}
          <v-divider></v-divider>

          <v-simple-table dense>
            <template v-slot:default>
                <thead>
                <tr>
                    <th class="text-left">
                    ID
                    </th>
                    <th class="text-left">
                    Aircraft
                    </th>
                    <th class="text-left">
                    Route
                    </th>
                    <th class="text-left">
                    ETD
                    </th>
                    <th class="text-left">
                    ETA
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr
                    v-for="flight in flights"
                    :key="flight.id"
                >
                    <td class="text-left">{{ flight.id }}</td>
                    <td class="text-left">{{ flight.aircraft_registration }}</td>
                    <td class="text-left">{{ flight.departure_airport.iata }}-{{ flight.arrival_airport.iata }}</td>
                    <td class="text-left">{{ flight.estimated_time_departure }}</td>
                    <td class="text-left">{{ flight.estimated_time_arrival }}</td>
                </tr>
                </tbody>
            </template>
          </v-simple-table>
      </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getFlightSchedule } from '../services/FlightService'
// eslint-disable-next-line no-unused-vars
import { Flight } from '../entity/flight'
import * as luxon from 'luxon'

@Component
export default class Flights extends Vue {
  flights: Array<Flight> = []

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
}

</script>
