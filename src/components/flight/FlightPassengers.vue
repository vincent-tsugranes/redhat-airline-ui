<template>
        <v-card>
          <v-card-text>
            Booking Summary
            <br/>
            <v-img content-class="seatmap" contain :src=getSeatmap() max-height="800" max-width="200"></v-img>
          </v-card-text>
        </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Flight } from '../../entity/flight'
// import * as luxon from 'luxon'

@Component({
  components: {
  }
})
export default class FlightPassengers extends Vue {
    @Prop() readonly flight! :Flight

    created () {
    }

    mounted () {
    }

    getSeatmap () {
      return require('../../../public/img/A380_seatmap.svg')
    }
}
</script>
