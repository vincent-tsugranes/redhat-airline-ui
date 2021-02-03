<template>
    <v-card elevation="6">
      <v-card-title style="padding-bottom: 0px">Airport: {{ airport.iata }} / {{ airport.icao }}</v-card-title>
        <v-container>
          <v-row no-gutters>
            <v-col class="text-left text-lg-body-12">
              Name: {{ airport.name }}
            </v-col>
            </v-row>
          </v-container>
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
