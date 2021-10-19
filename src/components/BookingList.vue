<template>
  <v-card>
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
            :items="bookings"
            :search="search"
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
                    <td class="text-left">{{ booking.id }}</td>
                    <td class="text-left">{{ booking.passenger_name }}</td>
                    <td class="text-left">{{ booking.flight_id }}</td>
                    <td class="text-left">{{ booking.departure_airport_iata }}</td>
                    <td class="text-left">{{ booking.arrival_airport_iata }}</td>
                    <td class="text-left">{{ booking.estimated_time_departure }}</td>
                    <td class="text-left">{{ booking.estimated_time_arrival }}</td>
              </tr>
            </template>
          </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Booking } from '../entity/booking'

@Component({
  components: {
  }
})
export default class BookingList extends Vue {
  bookings: Array<Booking> = []
  dateFormat = 'MM/dd HHmm'
  search = ''
  headers = [
    { text: 'ID', value: 'id' },
    { text: 'Name', value: 'passenger_name' },
    { text: 'Flight ID', value: 'flight_id' },
    { text: 'DEP', value: 'departure_airport_iata' },
    { text: 'ARR', value: 'arrival_airport_iata' },
    { text: 'ETD', value: 'estimated_time_departure' },
    { text: 'ETA', value: 'estimated_time_arrival' }]

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

  mounted () {
    console.log('Mounted Booking List Component')
    this.$store.dispatch('ENSURE_LOADED_BOOKINGS').then(() => {
      this.bookings = this.$store.state.bookings
    })
  }
}

</script>
