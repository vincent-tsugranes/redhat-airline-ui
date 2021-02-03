<template>
    <v-card elevation="6">
        <v-list-item three-line>
          <v-list-item-content>
            <v-list-item-subtitle>
              {{ airport.name }}
            </v-list-item-subtitle>
            <v-list-item-title class="headline mb-1">
              {{ airport.iata }} / {{ airport.icao }}
            </v-list-item-title>
            <div class='text-left'>
              <v-divider />
              <v-list-item-subtitle>City: {{ airport.city }}</v-list-item-subtitle>
              <v-list-item-subtitle>State: {{ airport.state }}</v-list-item-subtitle>
              <v-list-item-subtitle>Country: {{ airport.country }}</v-list-item-subtitle>
              <v-divider />
              <v-list-item-subtitle>Timezone: {{ airport.tz }}</v-list-item-subtitle>
              <v-list-item-subtitle>Elevation: {{ airport.elevation }}</v-list-item-subtitle>
              <v-list-item-subtitle>Coordinates: {{ airport.latitude }}, {{ airport.longitude }}</v-list-item-subtitle>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Airport } from '../../entity/airport'

@Component
export default class AirportCard extends Vue {
    @Prop() readonly airport! :Airport

    created () {
    }

    mounted () {
    }
}
</script>
